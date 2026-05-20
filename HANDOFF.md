# Handoff — Zi · Chatbot RH NV (Protótipo)

**Audiência:** quem for pegar este protótipo daqui pra frente — dev, designer, RH responsável pelo conteúdo, ou outra IDE assistente.
**Fase:** protótipo de validação interna no Grupo Soma. **Não é produção.**

---

## 1. Estado atual

| Item                          | Valor                                                                  |
| ----------------------------- | ---------------------------------------------------------------------- |
| Site (Netlify)                | <https://nv-rh-chatbot.netlify.app/>                                   |
| Repo (GitHub, público)        | <https://github.com/Kliente-360/grupo-soma-rh>                         |
| Branch única                  | `main` (sem feature branches, sem PRs — push direto)                   |
| Modelo chat                   | `gemini-2.5-flash` (com `thinkingBudget: 0`)                           |
| Modelo embedding              | `gemini-embedding-001` (768 dims via `outputDimensionality`)           |
| Stack                         | HTML + CSS + Vanilla JS + Netlify Edge Function + **Supabase (pgvector)** |
| Supabase project              | `istjvgvyzzjtxttqqffw`                                                 |
| Admin PIN                     | `NVRH2026` (validado server-side; sessionStorage no client)            |
| Env vars (Netlify)            | `GEMINI_ZI_API_KEY`, `SUPABASE_ZI_URL`, `SUPABASE_ZI_SECRET_KEY`       |

---

## 2. O produto em uma página

A **Zi** é uma assistente virtual de RH para colaboradores da **NV** (marca do Grupo Soma / AZZAS 2154). Responde dúvidas sobre **admissão, desligamento, benefícios, saúde, segurança da informação** com base **exclusivamente** nos documentos oficiais — agora vivem como chunks vetorizados no Supabase (pgvector).

### Regras centrais

1. **Tom amigável**, descontraído, próximo. "Colega da empresa", não "documento jurídico". Pode usar emojis com moderação (1 por mensagem no máx).
2. **KB-only.** Se a resposta não está nos chunks recuperados, retorna o token `[NAO_ENCONTREI]` (escondido do usuário) e dispara fluxo de escalação.
3. **Loop de treinamento.** Pergunta escalada → RH responde no painel admin → vira "resposta treinada" no Supabase → injetada no systemInstruction da próxima chamada. Sem retreinar modelo.

---

## 3. Arquitetura

```
┌──────────────┐    POST /api/zi    ┌─────────────────────────────┐
│  Browser     │ ─────────────────► │  Netlify Edge Function      │
│  index.html  │ ◄───── SSE ─────── │  zi.js (action dispatch)    │
└──────────────┘                    └──────┬──────────────────────┘
                                           │
                ┌──────────────────────────┼────────────────────────────┐
                │                          │                            │
                ▼                          ▼                            ▼
       ┌────────────────┐         ┌────────────────┐          ┌──────────────────┐
       │ Gemini embed   │         │ Supabase REST  │          │ Gemini chat      │
       │ (768d)         │         │ • match_kb_    │          │ streamGenerate-  │
       │                │         │   chunks RPC   │          │ Content (SSE)    │
       │                │         │ • zi_inter-    │          │                  │
       │                │         │   actions      │          │                  │
       │                │         │ • zi_trained_  │          │                  │
       │                │         │   answers      │          │                  │
       └────────────────┘         └────────────────┘          └──────────────────┘
```

**Fluxo de uma pergunta:**
1. Cliente POST `/api/zi` com `{action: "chat", messages: [...], session_id}`.
2. Edge function embeda a pergunta (`gemini-embedding-001`, 768d).
3. Chama RPC `match_kb_chunks` no Supabase → top-3 chunks por similaridade cosine.
4. Busca também todas `zi_trained_answers` ativas.
5. Insere placeholder em `zi_interactions` (pra correlacionar feedback/escalação depois) e devolve o `id` no header `X-Interaction-Id`.
6. Monta system prompt com chunks + treinadas, manda pro Gemini, faz stream SSE de volta.
7. Cliente, após stream terminar, faz `save_answer` separado pra completar a row.

A `GEMINI_ZI_API_KEY` e a `SUPABASE_ZI_SECRET_KEY` **nunca** trafegam pelo cliente — vivem só no env do Netlify.

---

## 4. Estrutura do repo

```
grupo-soma-rh/
├── index.html                        ← UI inteira (HTML + CSS + JS + avatar SVG)
├── netlify/
│   └── edge-functions/
│       └── zi.js                     ← action dispatcher (chat, feedback, escalate, admin_*)
├── netlify.toml                      ← config Netlify (publish = ".")
├── kb/
│   ├── README.md                     ← convenções de chunking + schema Supabase + retrieval
│   ├── admissao_colaborador.md       ← Termos admissionais (banco horas, VT, vendas virtuais)
│   ├── admissao_demissao_gestor.md   ← Guia do gestor (ponto, férias, desligamento CLT)
│   ├── assistencia_medica_odontologica.md  ← Planos GNDI/SulAmérica (time loja)
│   ├── beneficios.md                 ← Corporativo/operações/comercial + descontos marcas
│   ├── saude_bem_estar.md            ← FAQ SST (atestados, licenças, exames)
│   └── seguranca_informacao.md       ← Cartilha S.I.
├── supabase/
│   └── schema.sql                    ← pgvector + tabelas + RPC match_kb_chunks (idempotente)
├── scripts/
│   └── ingest_kb.py                  ← chunk H2 → Gemini embed → upsert kb_chunks
├── .env.example                      ← template das credenciais
├── .gitignore
├── README.md
└── HANDOFF.md                        ← este arquivo
```

Nenhum `package.json`, `node_modules` ou build. Tudo é estático + edge function single-file + script Python pra carga única.

---

## 5. Funcionalidades implementadas

### Chat (view padrão)
- Mensagem de boas-vindas fixa com avatar 30px
- 5 sugestões clicáveis abaixo (somem após a 1ª mensagem)
- **Streaming SSE** — texto chega token a token, cursor `▍` piscando durante geração
- Auto-scroll inteligente (só puxa pro fundo se o usuário já estava perto dele)
- Renderiza `**negrito**`, links auto, quebras de linha
- Estado typing (3 pontinhos) entre o envio e o 1º token
- Bolhas: usuário direita (`--nv-coffee`), Zi esquerda (`--nv-cream-deep`)

### Feedback 👍 / 👎
- Botões abaixo de respostas **reais** da Zi (não no welcome, não em erros, não em escalações)
- Clique trava o voto e atualiza `zi_interactions.rating` no Supabase via `POST /api/zi {action:"feedback"}`
- Cliente correlaciona com `interactionId` vindo do header `X-Interaction-Id` da resposta de chat

### Escalação (quando Zi diz `[NAO_ENCONTREI]`)
- Bolha pergunta "Quer que eu encaminhe pro RH?"
- Botões "Sim, encaminhar" / "Não, obrigado"
- Form inline com nome + e-mail (ambos opcionais)
- Marca `zi_interactions.escalated=true` + nome/email no Supabase
- Badge no botão "Admin RH" reflete `pending_count` server-side

### Admin RH (aba — protegido por PIN, validado server-side)
- **Gate**: digita PIN → cliente chama `admin_list_trained` como teste; se 200 OK, autenticado; sessão guardada em `sessionStorage`
- **Perguntas pendentes**: `zi_interactions WHERE escalated AND resolved_at IS NULL` — cards com textarea pra resposta + "Salvar e treinar"
- **Feedback dos colaboradores**: `zi_interactions WHERE rating IS NOT NULL` — contadores 👍/👎 + cards
- **Respostas treinadas**: `zi_trained_answers WHERE active`
- **Atualizar** + **Sair do admin** no rodapé

### Treinamento contínuo
Respostas validadas pelo RH viram linhas em `zi_trained_answers` (com `active=true`). Toda chamada do `chat` busca todas as ativas e injeta no system prompt como pares Q&A. Efeito é instantâneo — próxima pergunta já considera. Validado em produção: pergunta out-of-KB → escalação → admin responde → mesma pergunta passa a ser respondida com texto idêntico ao do RH.

---

## 6. Base de Conhecimento (KB)

**Onde está:** chunks vetorizados na tabela `kb_chunks` no Supabase (75 chunks no total, ~88KB de markdown).

**Fonte original:** 6 arquivos `.md` em `kb/` no repo (versionados). Foram convertidos de PDFs oficiais do RH NV.

**Cobertura atual:**

| Arquivo | Categoria | Audiência | Chunks |
|---|---|---|---|
| `admissao_colaborador.md` | admissao | colaborador | 5 |
| `admissao_demissao_gestor.md` | gestao_pessoas | gestor | 17 |
| `assistencia_medica_odontologica.md` | beneficios_saude | time_loja | 12 |
| `beneficios.md` | beneficios | colaborador | 23 |
| `saude_bem_estar.md` | saude_seguranca | colaborador | 7 |
| `seguranca_informacao.md` | seguranca_informacao | colaborador | 11 |

**Como editar:**
1. Editar o `.md` correspondente em `kb/`
2. `git push origin main` — Netlify redeploya, mas os chunks no Supabase **NÃO** atualizam sozinhos
3. Rodar `python3 scripts/ingest_kb.py` localmente (lê `.env`, gera embedding via Gemini, upsert no Supabase)
4. Upsert é idempotente (chave `source_file + section_title`) — só atualiza chunks que mudaram

**Retrieval:** edge function chama `match_kb_chunks(query_embedding, match_count=3, filter_audience=null, filter_category=null)`. Threshold observado: questões na KB têm similaridade ≥ ~0.74, fora têm ≤ ~0.60.

---

## 7. System prompt

**Onde:** função `buildSystemPrompt(chunks, trained)` em `netlify/edge-functions/zi.js`.

Estrutura:
1. **COMO VOCÊ FALA** — tom, "você", emojis moderados
2. **REGRA DE OURO** — responde se a base cobre; senão `[NAO_ENCONTREI]`
3. **BASE DE CONHECIMENTO** — top-3 chunks do `match_kb_chunks` (separados por `---`)
4. **RESPOSTAS APROVADAS PELO RH** — `zi_trained_answers` ativos como pares Q&A
5. **FORMATAÇÃO** — sem `###`, com `**negrito**`, listas numeradas só com 3+ passos

**Configuração crítica:** `thinkingConfig: { thinkingBudget: 0 }` (desliga modo "thinking" do Gemini 2.5 Flash) + `temperature: 0.2`. Sem isso o modelo dava `[NAO_ENCONTREI]` aleatoriamente em perguntas IN-KB. Veja gotcha 10.7.

Cada call reconstrói o prompt do zero. Mudou prompt → próxima pergunta já usa.

---

## 8. Deploy

### Setup inicial (já feito)

1. Repo conectado ao Netlify → site `nv-rh-chatbot.netlify.app`
2. Build command: *(vazio)* · Publish directory: `.` (raiz)
3. Edge function auto-discovered de `netlify/edge-functions/zi.js`
4. **Env vars configuradas** (Netlify → Site configuration → Environment variables, scope: All scopes):
   - `GEMINI_ZI_API_KEY` — Gemini API key (Google AI Studio)
   - `SUPABASE_ZI_URL` — `https://istjvgvyzzjtxttqqffw.supabase.co`
   - `SUPABASE_ZI_SECRET_KEY` — `sb_secret_...` (Supabase secret key, bypassa RLS)
5. Schema do Supabase aplicado (rodar `supabase/schema.sql` no SQL Editor 1x)
6. KB ingerida no Supabase via `python3 scripts/ingest_kb.py` (com `.env` local)

> Nota: o código aceita fallback pros nomes legados (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`) caso alguém recrie sem o prefixo `_ZI_`.

### Ciclo de iteração

```
# Mudar UI / edge function:
edit → git push origin main → Netlify redeploya (~30-60s)

# Mudar KB:
edit kb/*.md → git push → python3 scripts/ingest_kb.py (re-embeda no Supabase)

# Mudar respostas treinadas: usa o painel Admin RH no próprio site.
```

### Pra trocar uma API key (rotação)

1. Gerar key nova (Google AI Studio ou Supabase)
2. Netlify → Site configuration → Environment variables → editar valor
3. Deploys → Trigger deploy → Deploy site **(obrigatório — env var só atualiza em novo deploy)**

### Health checks

```bash
curl https://nv-rh-chatbot.netlify.app/api/zi
# "Zi proxy OK"

curl 'https://nv-rh-chatbot.netlify.app/api/zi?debug=1'
# JSON com hasGeminiKey/hasSupabaseUrl/hasSupabaseKey + nome das vars detectadas
```

---

## 9. Rodando local (opcional)

A função `/api/zi` só existe no runtime do Netlify. Pra rodar local:

```bash
npm install -g netlify-cli
# Cria .env com as 3 keys (gitignored):
cat > .env <<'EOF'
GEMINI_ZI_API_KEY=AIzaSy...
SUPABASE_ZI_URL=https://istjvgvyzzjtxttqqffw.supabase.co
SUPABASE_ZI_SECRET_KEY=sb_secret_...
EOF
netlify dev
# abre http://localhost:8888
```

Sem o CLI, dá pra abrir `index.html` direto no browser pra ver UI, mas o chat falha (sem proxy).

Pra rodar só o script de ingest (atualizar chunks sem subir site):
```bash
python3 -m pip install --user --break-system-packages requests python-frontmatter pypdf pdfplumber
python3 scripts/ingest_kb.py            # ingere/atualiza tudo
python3 scripts/ingest_kb.py --dry-run  # só lista chunks que seriam ingeridos
python3 scripts/ingest_kb.py --file beneficios.md  # só um arquivo
```

---

## 10. Aprendizados (gotchas que custaram tempo)

Vale ler antes de mexer.

### 10.1 Chaves do Gemini em repo público são revogadas em minutos
- Google tem scanner que indexa GitHub público; detecta `AIzaSy...` em commits
- Reporta automaticamente pra GCP; a key vira `PERMISSION_DENIED` em poucos minutos
- **Solução durável (já implementada):** key vive só na env var do Netlify, nunca em commit

### 10.2 Free tier do Gemini precisa de billing habilitado (contraintuitivo)
- Projeto Google **sem billing** → quota `generate_content_free_tier_requests: limit 0`
- "Habilitar billing" não cobra dentro do free tier — **destrava** o free tier
- Setup: <https://console.cloud.google.com/billing> → link no projeto certo

### 10.3 `gemini-2.0-flash-lite` foi descontinuado pra novas keys
- Retorna `404 NOT_FOUND` "no longer available to new users"
- Modelo atual estável: **`gemini-2.5-flash`**
- Constante `MODEL` em `netlify/edge-functions/zi.js`

### 10.4 Netlify Edge Functions e env vars
- Setar env var **não** atualiza função em runtime imediatamente
- **Precisa redeploy** (Trigger deploy ou novo git push)
- Scope da variável deve incluir **"All scopes"** ou no mínimo **"Runtime"** (não basta "Builds")
- Diagnóstico embutido: `GET /api/zi?debug=1` retorna booleans + lengths (sem vazar valor)

### 10.5 Não usar `<form>` no chat
- Em alguns embeds (iframe, certos contextos) o submit do form quebra
- Usar `onkeydown` direto no `<textarea>` com `if (e.key === 'Enter' && !e.shiftKey)`
- Já está implementado assim

### 10.6 PIN do admin é fricção, não segurança
- `NVRH2026` está no source (repo é público) **e** na edge function
- O servidor valida — não é só client-side — mas é constante hardcoded
- **OK porque é protótipo.** Em produção: SSO Google Workspace.

### 10.7 Gemini 2.5 Flash com "thinking" causa não-determinismo
- Modelo retornava ora a resposta correta, ora `[NAO_ENCONTREI]` pra mesma pergunta IN-KB
- Com `thoughtsTokenCount: ~188`, ele "raciocinava" e às vezes decidia que a base era insuficiente
- **Solução:** `generationConfig: { thinkingConfig: { thinkingBudget: 0 }, temperature: 0.2 }`
- Tarefa de RAG é determinística — não precisa de raciocínio interno

### 10.8 Marcadores de fonte ("--- fonte: arquivo.md ---") confundem o modelo
- Tentei colocar `--- Título (fonte: arquivo.md) ---` antes de cada chunk pra debug
- Gemini interpretava como metadado externo e descartava o conteúdo como "auxiliar"
- **Solução:** chunks já começam com `## Título` (do markdown), basta separá-los com `\n\n---\n\n`

### 10.9 Nomes de env vars no Netlify podem usar prefixo (`SUPABASE_ZI_*`)
- Em conta Netlify compartilhada com outros projetos, prefixar evita colisão
- Edge function aceita `GEMINI_ZI_API_KEY` OU `GEMINI_API_KEY` (fallback) — mesma lógica pras Supabase
- Helpers `geminiKey()`, `supabaseUrl()`, `supabaseKey()` centralizam a lógica

### 10.10 Supabase "secret key" novo formato (`sb_secret_*`)
- Em projetos novos não existe `service_role` JWT auto-gerada — precisa **criar** uma "secret key"
- Settings → API → Secret keys → Create new → escolher nome (ex: `edge-function-zi`)
- A key é mostrada **uma única vez** (igual GitHub PAT). Salvar imediatamente.
- O publishable key (`sb_publishable_*`) é o equivalente do `anon` — NÃO usar pra ingest/edge function

---

## 11. Limitações conhecidas (decisões intencionais pra protótipo)

| Limite                                              | Por quê é OK aqui                                                  | Plano de produção           |
| --------------------------------------------------- | ------------------------------------------------------------------ | --------------------------- |
| Admin protegido só por PIN                          | Fricção pra evitar curiosos durante validação                      | SSO Google Workspace        |
| Sem rate-limit no proxy                             | Free tier do Gemini já limita; tráfego baixo                       | Throttling por IP na edge   |
| Chat **não** persiste após F5                       | Decisão de design — escalações/feedback sim, chat efêmero          | Opcional manter assim       |
| Reingest manual após editar `kb/*.md`               | Script Python de uma linha resolve                                 | CI hook ou webhook do GitHub|
| Notificação de resposta do RH ao colaborador: zero  | Sessão local, sem identidade persistente                           | E-mail via Resend           |
| Sem analytics estruturado                           | 👍/👎 + escalações ficam em `zi_interactions` (queryável via SQL)  | Dashboard de métricas       |
| RLS desligado nas tabelas                           | Edge function usa secret key (server-side)                         | Ligar RLS + policies         |

---

## 12. Próximos passos

### Polimentos rápidos pra a fase de validação (1–2h cada)

- **Citações da KB no fim de cada resposta** (Zi termina com `_Fonte: [Seção do PDF]_`) — facilita auditoria pelo RH (a edge function já tem o `section_title` dos chunks retornados)
- **Persistir histórico do chat em localStorage/Supabase** — F5 não reseta a conversa, pra testes longos
- **"Reportar erro nesta resposta"** ligado ao 👎 — abre textarea curta, salva em `rating_comment`
- **Erro 429 amigável** — se a Gemini reclamar de quota, mostrar "tô em pico, tenta em 1 min" em vez de erro técnico
- **Sugestões de follow-up dinâmicas** — após cada resposta, pedir ao Gemini 2 perguntas relacionadas como chips
- **Reingest automático** — GitHub Action que roda `scripts/ingest_kb.py` quando algum arquivo em `kb/` muda

### Médio prazo

- **Threshold de retrieval** — se top similaridade < 0.65, curto-circuita pra `[NAO_ENCONTREI]` sem chamar Gemini (economia de tokens)
- **KB editável pelo painel admin** — textarea grande em Admin RH, salva em Supabase + reembed sob demanda
- **Exportar conversa em markdown** — botão "📋 copiar conversa" pra reports de validação
- **"Apagar tudo"** no admin — botão pra reset rápido entre sessões de teste
- **Dashboard básico** — top temas (LIKE query em zi_interactions.question), taxa de escalação, % positivas no feedback

### Migração pra produção (depois da validação aprovada)

- **Gemini 2.5 Flash → Claude Sonnet 4.5** (qualidade superior em PT-BR e em seguir regras estritas)
- **SSO no admin** — Google Workspace OAuth, removendo o PIN
- **RLS ligado** com policies por audiência (colaborador vs gestor vs admin)
- **Notificação por e-mail** quando admin responde (Resend ou SendGrid)
- **Rate limit por IP/sessão** na função proxy

---

## 13. Checklist de validação

Antes de mandar pro RH testar, confirme:

- [ ] `gh repo view Kliente-360/grupo-soma-rh` retorna o repo
- [ ] `curl https://nv-rh-chatbot.netlify.app/api/zi` retorna "Zi proxy OK"
- [ ] `curl 'https://nv-rh-chatbot.netlify.app/api/zi?debug=1'` mostra `hasGeminiKey/hasSupabaseUrl/hasSupabaseKey: true`
- [ ] Hard refresh no site, manda pergunta — streaming acontece (texto aparece progressivo)
- [ ] 👍 e 👎 aparecem abaixo da resposta, clique trava
- [ ] Pergunta fora da KB dispara fluxo de escalação
- [ ] Form de escalação salva → badge no Admin RH incrementa
- [ ] Aba Admin RH pede PIN, `NVRH2026` libera (PIN errado dá toast "PIN incorreto")
- [ ] Painel mostra pendente, feedback e treinadas (todos vindos do Supabase)
- [ ] Refazer mesma pergunta no chat após treinar — agora responde com o texto que o RH escreveu
- [ ] Fechar tab + abrir de novo → Admin RH pede PIN de novo
- [ ] Layout funciona em viewport de 380px (mobile)
- [ ] Tabela `zi_interactions` no Supabase tem linhas (uma por mensagem do user)

### Perguntas-padrão de aceitação

**Devem responder (na KB):**
1. "Como funciona o vale-refeição?"
2. "Quantos dias de licença paternidade eu tenho?"
3. "Como incluir minha filha no plano de saúde?"
4. "Tenho direito a day off no aniversário?"
5. "Quais documentos preciso pra incluir minha esposa no plano?"
6. "Quanto tempo posso continuar no plano depois que sair?"
7. "Como solicito férias?"
8. "Qual a regra pra senha de acesso?"
9. "O que faço se receber um e-mail suspeito?"
10. "Como funcionam as vans corporativas?"

**Devem escalar (fora da KB):**
1. "Posso pedir aumento de salário?"
2. "Quanto ganha um analista sênior?"
3. "Quem é o presidente da empresa?"
4. "Posso trabalhar remoto de Portugal?"
5. "Quantos dias de férias eu acumulei até hoje?"

---

## 14. Referências

- **Gemini API**: <https://ai.google.dev/api/generate-content>
- **Gemini rate limits**: <https://ai.google.dev/gemini-api/docs/rate-limits>
- **Netlify Edge Functions**: <https://docs.netlify.com/edge-functions/overview/>
- **Netlify env vars**: <https://docs.netlify.com/environment-variables/overview/>
- **Anthropic Claude API** (futura migração): <https://docs.anthropic.com/>

---

**Fim do handoff.** Qualquer dúvida estrutural não coberta aqui, é o tipo de coisa que precisa de uma conversa rápida com quem construiu (eu não tenho como conhecer cada decisão tácita).
