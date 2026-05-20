# Zi · Chatbot RH NV (Protótipo)

Assistente virtual de RH da NV (Grupo Soma / AZZAS 2154). Roda 100% no browser, sem backend. Versão de validação interna — **não usar em produção**.

## Stack

- HTML + CSS + Vanilla JS — UI inteira em **`index.html`**
- Gemini 2.5 Flash via **Netlify Edge Function** (`netlify/edge-functions/zi.js`) — proxy que esconde a API key
- `localStorage` — fila de pendentes, respostas treinadas e feedback 👍/👎

## Como deployar

Continuous deploy pelo GitHub:

1. Em https://app.netlify.com → **Add new site → Import an existing project** → conecta ao repo `Kliente-360/grupo-soma-rh` (branch `main`)
2. Build command: *(vazio)* · Publish directory: `.` (já configurado em `netlify.toml`)
3. **Antes do primeiro deploy funcionar**: vá em **Site settings → Environment variables → Add a variable** e adicione:
   - Key: `GEMINI_API_KEY`
   - Value: sua key do Google AI Studio (`AIzaSy...`)
4. Trigger redeploy ou faça um `git push` em main pra disparar build novo.

Cada `git push origin main` daqui pra frente faz redeploy automático.

## Como rodar localmente

A função `/api/zi` só existe no Netlify. Pra rodar local com a função:

```bash
npm install -g netlify-cli
netlify dev   # roda Netlify localmente, incluindo edge functions
```

Antes, exporte `GEMINI_API_KEY` no shell ou crie um `.env` local (já está no `.gitignore`).

## Funcionalidades

### Chat
- Mensagem de boas-vindas + 5 sugestões clicáveis
- Resposta da Zi baseada **exclusivamente** na KB embutida no system prompt
- Quando a Zi não sabe, retorna `[NAO_ENCONTREI]` e oferece encaminhar pro RH
- Formulário inline de escalação (nome + e-mail opcionais)

### Admin RH (aba no header)
- Lista de perguntas pendentes (escaladas pelos colaboradores)
- Textarea pra responder e botão "Salvar e treinar"
- Lista de respostas treinadas — passam a fazer parte do contexto da Zi na próxima conversa

### Persistência
- `zi_pending_questions` e `zi_trained_answers` no `localStorage`
- Sobrevive ao F5; é local do browser (não compartilhado entre usuários)

## Limitações conhecidas (esperadas pra protótipo)

| Limite | Por quê é OK aqui |
|---|---|
| Storage local por browser | Cada usuário vê sua própria fila/treinamento. Produção: Supabase. |
| Admin protegido só por PIN | `NVRH2026` no source. Friction, não segurança. Produção: SSO. |
| Sem rate-limit no proxy | Pode-se adicionar throttling por IP na edge function. |
| Chat não persiste após F5 | Decisão de design — só pendentes/treinadas/feedback persistem. |

## Migração pra produção (depois da validação)

- Gemini 2.5 Flash → **Claude Sonnet 4.5** (qualidade superior em PT-BR e em seguir regras estritas)
- `localStorage` → **Supabase** (pgvector pra KB + tabelas pra pendentes/treinadas/feedback)
- SSO no painel admin (Google Workspace) em vez do PIN
- Notificação por e-mail quando admin responde (Resend / SendGrid)
- Dashboard de métricas (top temas, taxa de escalação, sentimento dos feedbacks 👍/👎)
- Rate limit por IP/sessão na edge function

## Estrutura do repo

```
grupo-soma-rh/
├── index.html                       ← UI (HTML + CSS + JS + KB + SVG avatar)
├── netlify/
│   └── edge-functions/
│       └── zi.js                    ← proxy do Gemini (esconde a API key)
├── netlify.toml                     ← config Netlify
├── .gitignore
└── README.md
```

## Links úteis

- Gemini API docs: https://ai.google.dev/api/generate-content
- Free tier limits: https://ai.google.dev/pricing
- Google AI Studio (gerar key): https://aistudio.google.com/app/apikey
