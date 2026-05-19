# Zi · Chatbot RH NV (Protótipo)

Assistente virtual de RH da NV (Grupo Soma / AZZAS 2154). Roda 100% no browser, sem backend. Versão de validação interna — **não usar em produção**.

## Stack

- HTML + CSS + Vanilla JS — **tudo em `index.html`**
- Gemini 2.0 Flash (free tier) — chamada direta do browser
- `localStorage` — fila de pendentes e respostas treinadas

## Como rodar localmente

1. Obtenha uma API key gratuita em https://aistudio.google.com/app/apikey
2. Abra `index.html` num editor, ache a constante `GEMINI_API_KEY` no `<script>` e cole a key:
   ```js
   const GEMINI_API_KEY = "AIzaSy...";
   ```
3. Abra `index.html` no browser (duplo clique funciona, ou use um server estático).

## Como deployar

### Netlify (recomendado — deploy contínuo via GitHub)

1. Em https://app.netlify.com → **Add new site → Import an existing project**
2. Conecte ao repo `Kliente-360/grupo-soma-rh` (branch `main`)
3. Build command: *(vazio)* · Publish directory: `.`
4. Deploy. Cada `git push origin main` faz redeploy automático.

**Importante:** a `GEMINI_API_KEY` fica no HTML — qualquer um que abrir o site consegue ver. OK pra protótipo interno; **não** pra produção.

### Netlify Drop (sem repo)

1. https://app.netlify.com/drop
2. Arraste o arquivo `index.html` (ou a pasta inteira)

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
| API key exposta no HTML | Protótipo interno. Na produção, vai pra Netlify Function (proxy). |
| Storage local por browser | Cada usuário vê sua própria fila/treinamento. Produção: Supabase. |
| Admin sem auth | Aba visível pra qualquer um. Produção: SSO. |
| Sem rate-limit | Free tier Gemini já limita (15 RPM, 1500 req/dia). |
| Chat não persiste após F5 | Decisão de design — só pendentes/treinadas persistem. |

## Migração pra produção (depois da validação)

- Gemini 2.0 Flash → **Claude Sonnet 4** (qualidade superior em PT-BR e em seguir regras estritas)
- Direct browser call → **Netlify Function** (esconde API key)
- `localStorage` → **Supabase** (pgvector pra KB + tabelas pra pendentes/treinadas)
- SSO no painel admin (Google Workspace)
- Notificação por e-mail quando admin responde (Resend / SendGrid)
- Dashboard de métricas (top temas, taxa de escalação, tempo de resposta do RH)

## Estrutura do repo

```
grupo-soma-rh/
├── index.html       ← tudo aqui (HTML + CSS + JS + KB + SVG avatar)
├── netlify.toml     ← config Netlify (publish = ".")
├── .gitignore
└── README.md
```

## Links úteis

- Gemini API docs: https://ai.google.dev/api/generate-content
- Free tier limits: https://ai.google.dev/pricing
- Google AI Studio (gerar key): https://aistudio.google.com/app/apikey
