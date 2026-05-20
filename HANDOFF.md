# Handoff — Zi · Chatbot RH NV (Protótipo)

**Audiência:** quem for pegar este protótipo daqui pra frente — dev, designer, RH responsável pelo conteúdo, ou outra IDE assistente.
**Fase:** protótipo de validação interna no Grupo Soma. **Não é produção.**

---

## 1. Estado atual

| Item                          | Valor                                                                  |
| ----------------------------- | ---------------------------------------------------------------------- |
| Site (Netlify)                | <https://grupo-soma-rh.netlify.app/>                                   |
| Repo (GitHub, público)        | <https://github.com/Kliente-360/grupo-soma-rh>                         |
| Branch única                  | `main` (sem feature branches, sem PRs — push direto)                   |
| Modelo LLM                    | `gemini-2.5-flash`                                                     |
| Stack                         | HTML + CSS + Vanilla JS (`index.html`) + Netlify Edge Function (proxy) |
| API key                       | **Não está no repo.** Vive como `GEMINI_API_KEY` no env var do Netlify |
| Admin PIN                     | `NVRH2026` (no source — fricção, não segurança)                        |

---

## 2. O produto em uma página

A **Zi** é uma assistente virtual de RH para colaboradores da **NV** (marca do Grupo Soma / AZZAS 2154). Responde dúvidas sobre **admissão, desligamento, benefícios, saúde, segurança da informação** com base **exclusivamente** nos documentos oficiais embutidos na base de conhecimento (KB) do prompt.

### Regras centrais

1. **Tom amigável**, descontraído, próximo. "Colega da empresa", não "documento jurídico". Pode usar emojis com moderação (1 por mensagem no máx).
2. **KB-only.** Se a resposta não está na KB, retorna o token `[NAO_ENCONTREI]` (escondido do usuário) e dispara fluxo de escalação.
3. **Loop de treinamento.** Pergunta escalada → RH responde no painel admin → vira "resposta treinada" → entra no systemInstruction da próxima chamada. Sem retreinar modelo, sem vector DB.

---

## 3. Arquitetura

```
┌──────────────┐    POST /api/zi    ┌─────────────────────────┐    streamGenerateContent    ┌──────────┐
│  Browser     │ ─────────────────► │  Netlify Edge Function  │ ──────────────────────────► │  Gemini  │
│  index.html  │ ◄───── SSE ─────── │     zi.js (Deno)        │ ◄────── SSE stream ──────── │ 2.5-Flash│
└──────────────┘                    └─────────────────────────┘                             └──────────┘
       │                                       ▲
       │                                       │ Netlify.env.get('GEMINI_API_KEY')
       │                                       │
       └─ localStorage (pending, trained, feedback) ─ sessionStorage (admin auth)
```

A key **nunca** trafega pelo cliente. O proxy edge é um pass-through: recebe o payload do browser, anexa a key, repassa pro Gemini, devolve o stream SSE como veio.

---

## 4. Estrutura do repo

```
grupo-soma-rh/
├── index.html                        ← UI inteira (HTML + CSS + JS + KB + avatar SVG)
├── netlify/
│   └── edge-functions/
│       └── zi.js                     ← proxy do Gemini (lê GEMINI_API_KEY do env)
├── netlify.toml                      ← config Netlify (publish = ".")
├── .gitignore                        ← exclui .DS_Store, .claude/, .env
├── README.md                         ← deploy + dev local
└── HANDOFF.md                        ← este arquivo
```

Nenhum `package.json`, `node_modules` ou build. Tudo é estático + edge function single-file.

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
- Clique trava o voto e salva `{question, answer, rating, timestamp}` em `localStorage` (`zi_feedback`)
- Visível pro RH na aba Admin

### Escalação (quando Zi diz `[NAO_ENCONTREI]`)
- Bolha pergunta "Quer que eu encaminhe pro RH?"
- Botões "Sim, encaminhar" / "Não, obrigado"
- Form inline com nome + e-mail (ambos opcionais)
- Salva em `localStorage` (`zi_pending_questions`)
- Badge no botão "Admin RH" mostra contagem

### Admin RH (aba — protegido por PIN)
- **Gate**: input de PIN; correto → libera; sessão dura até fechar a tab (`sessionStorage`)
- **Perguntas pendentes**: cards com pergunta + textarea pra resposta + "Salvar e treinar"
- **Feedback dos colaboradores**: contadores 👍/👎 + cards individuais
- **Respostas treinadas**: lista (mais recente no topo); cada uma com botão "Remover"
- **Sair do admin** no rodapé

### Treinamento contínuo
Respostas validadas pelo RH são injetadas no `systemInstruction` em **toda** chamada subsequente. O bot "aprende" sem retreinar — o efeito é instantâneo.

---

## 6. Base de Conhecimento (KB)

**Onde está:** constante `KNOWLEDGE_BASE` dentro do `<script>` em `index.html` (~5.000 caracteres, ~1.500-2.000 tokens).

**Cobertura atual:**
- ADMISSÃO (documentos, vale-transporte)
- DESLIGAMENTO (tipos de aviso, pesquisas, plano de saúde após desligamento)
- BENEFÍCIOS (médico, seguro de vida, VR, VT, vans, Day Off, Wellz, academias, licenças estendidas)
- SAÚDE E SEGURANÇA (atestado, acidente, licenças, exames, férias)
- SEGURANÇA DA INFORMAÇÃO (PGSI, senhas, e-mails suspeitos, responsabilidades)
- CONTATOS (telefones, portais)

**Como editar:**
1. Abrir `index.html`
2. Encontrar `const KNOWLEDGE_BASE = \`# ADMISSÃO ...`
3. Editar o conteúdo (markdown plain)
4. `git add . && git commit -m "..." && git push origin main`
5. Netlify redeploya automático em ~30-60s

**Sem chunking, sem RAG.** A KB inteira vai no `systemInstruction` em toda chamada. Custos: ~2.000 tokens de entrada extra por request. Aceitável até a KB passar de ~20k tokens.

---

## 7. System prompt

**Onde:** função `buildSystemPrompt(trained)` em `index.html`.

Estrutura:
1. **COMO VOCÊ FALA** — tom, "você" em vez de "vocês", emojis moderados
2. **REGRA DE OURO** — só KB; senão `[NAO_ENCONTREI]` e nada mais
3. **BASE DE CONHECIMENTO** — `${KNOWLEDGE_BASE}` injetada
4. **RESPOSTAS APROVADAS PELO RH** — `trainedAnswers` injetadas como Q&A pairs
5. **FORMATAÇÃO** — sem `###`, com `**negrito**`, listas numeradas só com 3+ passos

Cada call do Gemini reconstrói o prompt do zero. Se você mudar o prompt, o efeito é imediato (próxima pergunta usa a nova versão).

---

## 8. Deploy

### Setup inicial (já feito)

1. Repo conectado ao Netlify → site `grupo-soma-rh.netlify.app`
2. Build command: *(vazio)*
3. Publish directory: `.` (raiz)
4. Edge function auto-discovered de `netlify/edge-functions/zi.js`
5. **Env var `GEMINI_API_KEY` configurada** no painel Netlify (Site configuration → Environment variables, scope: All)

### Ciclo de iteração

```
edit → git add . → git commit → git push origin main → Netlify redeploya (~30-60s)
```

### Pra trocar a API key (rotação)

1. Gerar nova key em <https://aistudio.google.com/app/apikey>
2. Netlify → Site configuration → Environment variables → editar `GEMINI_API_KEY`
3. Deploys → Trigger deploy → Deploy site **(obrigatório — env var só atualiza em novo deploy)**

### Health checks

```bash
curl https://grupo-soma-rh.netlify.app/api/zi
# Deve retornar "Zi proxy OK"

curl 'https://grupo-soma-rh.netlify.app/api/zi?debug=1'
# JSON com {netlifyApiSeesKey, denoApiSeesKey, lengths} — útil pra confirmar env var
```

---

## 9. Rodando local (opcional)

A função `/api/zi` só existe dentro do runtime do Netlify. Pra rodar local:

```bash
npm install -g netlify-cli
echo "GEMINI_API_KEY=AIzaSy..." > .env   # gitignored
netlify dev
# abre http://localhost:8888
```

Sem o CLI, dá pra abrir `index.html` direto no browser pra ver UI, mas o chat falha (sem proxy).

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
- `NVRH2026` está no source (repo é público)
- Qualquer um que olhar consegue ver
- **OK porque é protótipo.** Em produção: SSO Google Workspace.

---

## 11. Limitações conhecidas (decisões intencionais pra protótipo)

| Limite                                              | Por quê é OK aqui                                                  | Plano de produção           |
| --------------------------------------------------- | ------------------------------------------------------------------ | --------------------------- |
| Storage local por browser                           | Cada usuário tem sua própria fila e treinamento (não compartilha) | Supabase (Postgres)         |
| Admin protegido só por PIN                          | Fricção pra evitar curiosos durante validação                      | SSO Google Workspace        |
| Sem rate-limit no proxy                             | Free tier do Gemini já limita; tráfego baixo                       | Throttling por IP na edge   |
| Chat **não** persiste após F5                       | Decisão de design — escalações/feedback sim, chat efêmero          | Opcional manter assim       |
| KB hardcoded no `index.html`                        | Edição via git é OK pra prototipagem                               | Editor visual + Supabase    |
| Notificação de resposta do RH ao colaborador: zero  | Sessão local, sem identidade persistente                           | E-mail via Resend           |
| Sem analytics estruturado                           | 👍/👎 + escalações já dão sinal qualitativo                        | Dashboard de métricas       |

---

## 12. Próximos passos

### Polimentos rápidos pra a fase de validação (1–2h cada)

- **Citações da KB no fim de cada resposta** (Zi termina com `_Fonte: [Seção]_`) — facilita auditoria pelo RH durante testes
- **Persistir histórico do chat em localStorage** — F5 não reseta a conversa, pra testes longos
- **"Reportar erro nesta resposta"** ligado ao 👎 — abre textarea curta, vira terceira lista no admin
- **Erro 429 amigável** — se a Gemini reclamar de quota, mostrar "tô em pico, tenta em 1 min" em vez de erro técnico
- **Sugestões de follow-up dinâmicas** — após cada resposta, pedir ao Gemini 2 perguntas relacionadas como chips

### Médio prazo

- **KB editável pelo painel admin** — textarea grande em Admin RH, sobrescreve KB em runtime; RH itera sozinho sem precisar de dev
- **Exportar conversa em markdown** — botão "📋 copiar conversa" pra reports de validação
- **"Apagar tudo"** no admin — botão pra reset rápido entre sessões de teste

### Migração pra produção (depois da validação aprovada)

- **Gemini 2.5 Flash → Claude Sonnet 4.5** (qualidade superior em PT-BR e em seguir regras estritas)
- **Edge Function → Supabase Edge Function** ou **Netlify Function v2** com:
  - **Supabase Postgres + pgvector** pra KB chunkada
  - **Supabase tabelas** pra pending_questions, trained_answers, feedback (multi-usuário, multi-device)
- **SSO no admin** — Google Workspace OAuth
- **Notificação por e-mail** quando admin responde (Resend ou SendGrid)
- **Rate limit por IP/sessão** na função proxy
- **Dashboard de métricas**: top temas, taxa de escalação, % positivas no feedback, tempo médio de resposta do RH

---

## 13. Checklist de validação

Antes de mandar pro RH testar, confirme:

- [ ] `gh repo view Kliente-360/grupo-soma-rh` retorna o repo
- [ ] `curl https://grupo-soma-rh.netlify.app/api/zi` retorna "Zi proxy OK"
- [ ] `curl 'https://grupo-soma-rh.netlify.app/api/zi?debug=1'` mostra `netlifyApiSeesKey: true`
- [ ] Hard refresh no site, manda pergunta — streaming acontece (texto aparece progressivo)
- [ ] 👍 e 👎 aparecem abaixo da resposta, clique trava
- [ ] Pergunta fora da KB dispara fluxo de escalação
- [ ] Form de escalação salva → badge no Admin RH incrementa
- [ ] Aba Admin RH pede PIN, `NVRH2026` libera
- [ ] Painel mostra pendente, feedback e treinadas
- [ ] Refazer mesma pergunta no chat após treinar — agora responde sem escalar
- [ ] Fechar tab + abrir de novo → Admin RH pede PIN de novo
- [ ] Layout funciona em viewport de 380px (mobile)

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
