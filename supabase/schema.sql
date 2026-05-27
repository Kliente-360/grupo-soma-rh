-- KB Schema para a Zi (Chatbot RH NV)
-- Rodar UMA VEZ no Supabase: Dashboard → SQL Editor → New query → cola tudo → Run
--
-- Idempotente: pode rodar de novo sem quebrar (CREATE IF NOT EXISTS / DROP+CREATE em RPCs).

-- ============================================================================
-- 1) Extensão pgvector
-- ============================================================================

create extension if not exists vector;

-- ============================================================================
-- 2) Tabela principal — um chunk por seção H2 dos MDs em kb/
-- ============================================================================

create table if not exists kb_chunks (
  id            bigserial primary key,
  source_file   text not null,            -- ex: 'beneficios.md'
  category      text not null,            -- 'admissao', 'beneficios', 'beneficios_saude', 'saude_seguranca', 'seguranca_informacao', 'gestao_pessoas'
  audience      text not null,            -- 'colaborador', 'gestor', 'time_loja'
  section_title text not null,            -- texto do H2 (ex: 'Day Off — Folga de Aniversário')
  content       text not null,            -- markdown bruto do chunk (do H2 até antes do próximo H2)
  token_count   int,                      -- estimativa pra debug (~ chars/4)
  embedding     vector(768),              -- Gemini text-embedding-004 = 768 dims
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- Chave natural pra upsert: o mesmo chunk não duplica em reembedding
  unique (source_file, section_title)
);

-- Trigger pra manter updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kb_chunks_updated_at on kb_chunks;
create trigger kb_chunks_updated_at
  before update on kb_chunks
  for each row execute function set_updated_at();

-- ============================================================================
-- 3) Índices
-- ============================================================================

-- Vetorial: ivfflat com cosine (suficiente pra <100k chunks; pra mais usar hnsw)
create index if not exists kb_chunks_embedding_idx
  on kb_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Filtros baratos
create index if not exists kb_chunks_category_idx on kb_chunks (category);
create index if not exists kb_chunks_audience_idx on kb_chunks (audience);
create index if not exists kb_chunks_metadata_idx on kb_chunks using gin (metadata);

-- ============================================================================
-- 4) Função de busca semântica (RPC chamada da edge function)
-- ============================================================================
-- Uso: select * from match_kb_chunks(<embedding>, 5, null, null);
--      select * from match_kb_chunks(<embedding>, 3, 'colaborador', 'beneficios');

create or replace function match_kb_chunks(
  query_embedding vector(768),
  match_count int default 5,
  filter_audience text default null,
  filter_category text default null
)
returns table (
  id            bigint,
  source_file   text,
  category      text,
  audience      text,
  section_title text,
  content       text,
  similarity    float
)
language sql stable as $$
  select
    c.id,
    c.source_file,
    c.category,
    c.audience,
    c.section_title,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from kb_chunks c
  where (filter_audience is null or c.audience = filter_audience or c.audience = 'colaborador')
    and (filter_category is null or c.category = filter_category)
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================================
-- 5) Tabela de telemetria (opcional mas recomendado) — q/a/feedback do chat
-- ============================================================================
-- Substituirá o localStorage da fase prototipagem. Permite RH ver agregado real.

create table if not exists zi_interactions (
  id              bigserial primary key,
  session_id      text,                       -- id efêmero do browser
  question        text not null,
  answer          text,                       -- nulo se [NAO_ENCONTREI]
  retrieved_ids   bigint[],                   -- chunks recuperados (debug)
  rating          smallint,                   -- 1 (👍) / -1 (👎) / null
  rating_at       timestamptz,
  rating_comment  text,
  escalated       boolean default false,
  resolved_at     timestamptz,                -- preenchido quando admin treina ou descarta a escalação
  user_name       text,                       -- se preencheu form de escalação
  user_email      text,
  created_at      timestamptz default now()
);

-- Migração idempotente pra bancos que já têm a tabela sem resolved_at
alter table zi_interactions add column if not exists resolved_at timestamptz;

-- Coluna username — quem mandou o chat (admin/user role)
-- Usada pra contar usuários únicos no dashboard
alter table zi_interactions add column if not exists username text;
create index if not exists zi_interactions_username_idx on zi_interactions (username);

-- Coluna category — tópico dominante dos chunks recuperados na resposta.
-- Permite agregar "60% das perguntas são de benefícios" no dashboard de pilot.
alter table zi_interactions add column if not exists category text;
create index if not exists zi_interactions_category_idx on zi_interactions (category);

create index if not exists zi_interactions_created_idx on zi_interactions (created_at desc);
create index if not exists zi_interactions_rating_idx on zi_interactions (rating) where rating is not null;
create index if not exists zi_interactions_escalated_idx on zi_interactions (escalated, resolved_at) where escalated = true;

-- ============================================================================
-- 6) Tabela de respostas treinadas (substitui zi_trained_answers do localStorage)
-- ============================================================================

create table if not exists zi_trained_answers (
  id              bigserial primary key,
  question        text not null,
  answer          text not null,
  source_question_id bigint references zi_interactions(id) on delete set null,
  trained_by      text,                       -- email do admin que treinou
  active          boolean default true,
  embedding       vector(768),                -- pra incluir essas respostas no retrieval também
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

drop trigger if exists zi_trained_answers_updated_at on zi_trained_answers;
create trigger zi_trained_answers_updated_at
  before update on zi_trained_answers
  for each row execute function set_updated_at();

create index if not exists zi_trained_answers_active_idx on zi_trained_answers (active) where active = true;
create index if not exists zi_trained_answers_embedding_idx
  on zi_trained_answers using ivfflat (embedding vector_cosine_ops)
  with (lists = 50);

-- ============================================================================
-- 7) RLS — desligado por enquanto (chamadas vêm da edge function com service_role)
-- ============================================================================
-- Quando expor diretamente ao client, ligar RLS e criar policies por audiência.

alter table kb_chunks         disable row level security;
alter table zi_interactions   disable row level security;
alter table zi_trained_answers disable row level security;

-- ============================================================================
-- Fim. Verificação rápida:
--   select count(*) from kb_chunks;  -- deve dar 0 antes do ingest
--   select * from pg_indexes where tablename = 'kb_chunks';
-- ============================================================================
