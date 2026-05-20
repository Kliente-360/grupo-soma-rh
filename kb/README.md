# KB — Base de Conhecimento Estruturada

Markdown estruturado dos documentos oficiais de RH da NV (Grupo Soma / AZZAS 2154), pronto para ingestão em vector DB (Supabase + pgvector).

## Arquivos

| Arquivo | Categoria | Audiência | Chunks (H2) | Origem |
|---|---|---|---|---|
| [admissao_colaborador.md](admissao_colaborador.md) | `admissao` | Colaborador | 5 | Termos Admissionais AZZAS 2154 |
| [admissao_demissao_gestor.md](admissao_demissao_gestor.md) | `gestao_pessoas` | Gestor | 17 | Gestor em Ação — Guia de Processos |
| [assistencia_medica_odontologica.md](assistencia_medica_odontologica.md) | `beneficios_saude` | Time Loja | 12 | Assistência Médica e Odontológica |
| [beneficios.md](beneficios.md) | `beneficios` | Colaborador | 23 | Cartilha de Benefícios (Maio/26) |
| [saude_bem_estar.md](saude_bem_estar.md) | `saude_seguranca` | Colaborador | 7 | Perguntas Frequentes SST |
| [seguranca_informacao.md](seguranca_informacao.md) | `seguranca_informacao` | Colaborador | 11 | Cartilha de Segurança da Informação |

**Total:** 75 chunks (boundaries em H2).

## Convenção de Estrutura

Cada arquivo segue:

```markdown
---
title: <título humano>
source_pdf: <nome do PDF original>
category: <admissao | gestao_pessoas | beneficios | beneficios_saude | saude_seguranca | seguranca_informacao>
audience: <colaborador | gestor | time_loja>
source_pages: <n>
last_updated: <YYYY-MM-DD>
---

# <título>

<lead opcional, 1-2 parágrafos>

## <Seção 1>          ← fronteira de chunk
...

### <Subseção>        ← faz parte do chunk pai
...

## <Seção 2>          ← novo chunk
...
```

**Regra de chunking:** cada `## H2` é uma **unidade de retrieval**. Subseções (`###`) ficam no mesmo chunk que o pai. Isso preserva coerência semântica — uma busca por "como solicitar férias" retorna o bloco inteiro de regras de marcação, não meia explicação.

## Estratégia de Ingestão no Supabase

### 1. Schema sugerido

```sql
-- Tabela base
create extension if not exists vector;

create table kb_chunks (
  id            bigserial primary key,
  source_file   text not null,        -- ex: 'beneficios.md'
  category      text not null,        -- frontmatter.category
  audience      text not null,        -- frontmatter.audience
  section_title text not null,        -- texto do H2
  section_path  text,                 -- "Assistência Médica > Tabela de Elegibilidade"
  content       text not null,        -- markdown bruto do chunk
  token_count   int,                  -- útil pra debug
  embedding     vector(1536),         -- text-embedding-3-small / Gemini
  metadata      jsonb default '{}',
  created_at    timestamptz default now()
);

-- Índices
create index on kb_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on kb_chunks (category);
create index on kb_chunks (audience);
create index on kb_chunks using gin (metadata);
```

### 2. Script de chunking (pseudo)

```python
import frontmatter, re

def chunk_markdown(md_path):
    post = frontmatter.load(md_path)
    meta = post.metadata
    body = post.content

    # Split em H2 (## ), preservando subseções H3+ no chunk pai
    chunks = re.split(r'\n(?=## )', body)

    for chunk in chunks:
        # Primeiro é o lead (antes do primeiro ##) — pula ou trata como "intro"
        if not chunk.startswith('## '):
            continue

        title = re.match(r'## (.+)', chunk).group(1).strip()
        yield {
            'source_file': meta['source_pdf'].replace('.pdf', '.md'),
            'category': meta['category'],
            'audience': meta['audience'],
            'section_title': title,
            'content': chunk,
            'metadata': {
                'last_updated': meta['last_updated'],
                'source_pages': meta['source_pages'],
            }
        }
```

### 3. Embeddings

Recomendo um destes (em ordem de preferência por custo/qualidade em PT-BR):

| Modelo | Dim | Custo / 1M tokens | Notas |
|---|---|---|---|
| **Gemini `gemini-embedding-001`** ✅ (em uso) | 768 (configurável) | grátis (free tier) | Em produção; suporta MRL — pedimos 768 dim pra economizar storage |
| OpenAI `text-embedding-3-small` | 1536 | US$ 0,02 | Padrão sólido, multilíngue forte |
| Cohere `embed-multilingual-v3` | 1024 | US$ 0,10 | Especializado multilíngue |

**Em uso:** `gemini-embedding-001` (substituiu o `text-embedding-004` que foi descontinuado para keys novas). Output forçado em 768 dimensões via parâmetro `outputDimensionality` pra bater com o schema `vector(768)`.

**Validado em retrieval** (Top-1 score em queries reais):
- "Como solicito férias?" → chunk Férias, 0.766
- "Licença paternidade?" → chunk Licença Paternidade, 0.798
- "E-mail suspeito?" → chunk E-mails/Phishing, 0.780
- "Vale-refeição?" → chunk Alimentação, 0.748
- "Day off?" → chunk Day Off, 0.850

Perguntas fora da KB (presidente da empresa, trabalho remoto de Portugal) ficam <= 0.60 — **threshold ~0.65 separa in-KB de out-of-KB** com folga.

### 4. Retrieval Pattern

```sql
-- Busca híbrida: similaridade vetorial + filtro por audiência
select id, section_title, content,
       1 - (embedding <=> $1::vector) as similarity
from kb_chunks
where audience in ('colaborador', $2)  -- $2 = audiência do usuário
order by embedding <=> $1::vector
limit 5;
```

**Top-K sugerido:** 3 a 5 chunks. Para a Zi (chat), 3 é suficiente — economiza tokens no system prompt sem perder cobertura.

### 5. Migração do `index.html`

Hoje a `KNOWLEDGE_BASE` é uma string grande no `<script>`. Para migrar:

1. Edge function busca top-3 chunks no Supabase pela query do usuário.
2. Monta system prompt com chunks recuperados em vez da KB inteira.
3. Reduz drasticamente tokens de input (de ~2000 fixos para ~600-800 sob demanda).

```js
// pseudo na edge function
const queryEmbedding = await embed(userQuestion);
const chunks = await supabase.rpc('match_kb_chunks', { query_embedding: queryEmbedding, audience: 'colaborador', top_k: 3 });
const systemPrompt = buildSystemPrompt(chunks.map(c => c.content).join('\n\n'));
```

## Manutenção da KB

**Editar conteúdo:**
1. Editar o `.md` correspondente.
2. Commit + push em `main`.
3. Reembedar **apenas o(s) chunk(s) alterado(s)** (não a base inteira) — usar `source_file + section_title` como chave de upsert.

**Adicionar novo documento:**
1. Criar novo `.md` em `kb/` com a frontmatter padrão.
2. Adicionar à tabela acima neste README.
3. Rodar script de ingestão pra ele.

**Lacunas conhecidas (a investigar com o RH):**
- Tabela de "Atualização de Prazos de Banco de Horas" no Guia do Gestor estava como imagem no PDF — não extraída.
- Fluxograma visual de responsabilidades (Iniciativa Empresa) tem a parte gráfica perdida; texto preservado.
- Telas/screenshots de portais (Portal RM, Portal de Chamados) descritos por texto, sem prints.

## Próximos passos

- [ ] Validar conteúdo com o time de RH da NV (especialmente valores, prazos e tabelas)
- [ ] Definir embedding model (Gemini vs OpenAI)
- [ ] Criar projeto Supabase + executar schema
- [ ] Script de ingestão (Node ou Python) — uma única execução pra carregar
- [ ] Endpoint `match_kb_chunks` (Postgres function) no Supabase
- [ ] Migrar edge function `zi.js` pra retrieval híbrido
- [ ] Tracking: salvar (query, chunks recuperados, resposta) em outra tabela pra análise
