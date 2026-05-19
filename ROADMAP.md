# Zi · Roadmap de Produto

> Documento vivo. Registra decisões de arquitetura, prioridades e evolução do produto.
> Última atualização: 2026-05-19

---

## Contexto do produto

**Zi** é o assistente virtual de RH da NV (Grupo Soma / AZZAS 2154). Responde dúvidas de colaboradores sobre políticas de RH com base em uma knowledge base (KB) interna. Quando não sabe, escalona para o time de RH, que treina a resposta — e a Zi aprende.

**Princípio norteador:** o diferencial real não é o chat — é o **loop de aprendizado contínuo**:

```
Colaborador pergunta → Zi não sabe → Escalação → RH treina → Zi aprende → Menos escalações
```

Toda decisão de produto deve acelerar e fortalecer esse loop.

---

## Estado atual do protótipo

| Dimensão        | Hoje                                              |
|-----------------|---------------------------------------------------|
| LLM             | Gemini 2.0 Flash (chamada direta do browser)      |
| Storage         | `localStorage` (browser-local, não compartilhado) |
| Auth            | Nenhuma (admin aberto)                            |
| Backend         | Não existe                                        |
| Deploy          | Netlify estático                                  |
| Código          | Single-file `index.html` (1385 linhas)            |

**Constraint de arquitetura decidido:** manter 100% no browser enquanto possível. Sem servidor próprio. Qualquer serviço externo deve ter SDK JS nativo (Supabase, Resend, etc.).

---

## Decisões de arquitetura registradas

### ADR-001 — Manter single-file durante validação
**Data:** 2026-05-19
**Decisão:** Não quebrar em múltiplos arquivos/bundler enquanto o produto não for validado com usuários reais.
**Motivação:** Velocidade de iteração. Deploy = arrastar um arquivo. Zero config.
**Trade-off aceito:** Arquivo grande, difícil de navegar. Aceitável para protótipo.
**Revisar quando:** produto validado e time crescer.

### ADR-002 — Constraint 100% browser (sem backend próprio)
**Data:** 2026-05-19
**Decisão:** Usar apenas serviços com SDK JS que rodam no browser (Supabase, Resend, Claude API).
**Motivação:** Zero ops. Sem servidor pra manter, escalar ou pagar.
**Trade-off aceito:** API keys parcialmente expostas no cliente (mitigável com RLS e CORS restrictions).
**Revisar quando:** surgir requisito que não seja satisfazível no browser (ex: webhooks, crons).

### ADR-003 — Migrar de Gemini para Claude Sonnet 4
**Data:** 2026-05-19
**Decisão:** Substituir Gemini 2.0 Flash pelo Claude Sonnet 4 como LLM principal.
**Motivação:** Claude é significativamente mais preciso em PT-BR e mais rigoroso em seguir regras estritas como o token `[NAO_ENCONTREI]`. Reduz alucinações, melhora a experiência do colaborador.
**Status:** pendente de implementação.

---

## Roadmap por fases

### Fase 1 — Qualidade do núcleo
> **Meta:** Zi mais precisa, menos mentirosa, mais eficiente.

| # | Item | Impacto | Esforço | Status |
|---|------|---------|---------|--------|
| 1.1 | Migrar LLM: Gemini → Claude Sonnet 4 | Alto | Baixo | Pendente |
| 1.2 | Corrigir copy enganoso ("te aviso por aqui") | Médio | Mínimo | Pendente |
| 1.3 | Melhorar gestão de contexto (filtrar msgs de UI, limitar histórico) | Médio | Baixo | Pendente |
| 1.4 | Track de gaps da KB (logar `[NAO_ENCONTREI]` no localStorage) | Alto | Baixo | Pendente |

**Detalhes:**

- **1.2 — Copy honesto:** o bot promete notificar o colaborador quando o RH responder, mas nunca faz isso. Corrigir para algo como *"Assim que o RH responder, a resposta fica disponível aqui. Pode perguntar de novo ou reformular."*
- **1.3 — Contexto:** hoje todo o histórico de mensagens (incluindo msgs de UI como `escalate-form`) vai pro modelo. Fix: filtrar `type === 'regular'` + limitar a últimas 20 mensagens para controlar custo e evitar degradação de qualidade em conversas longas.
- **1.4 — Gap tracking:** guardar cada `[NAO_ENCONTREI]` com a pergunta no localStorage. Seção no admin mostra top temas sem cobertura. RH prioriza o que treinar.

---

### Fase 2 — Agente no admin (o pulo do gato)
> **Meta:** Reduzir o tempo de resposta do RH de horas para minutos com AI Draft.

| # | Item | Impacto | Esforço | Status |
|---|------|---------|---------|--------|
| 2.1 | AI Draft — Claude rascunha resposta para o RH | Muito Alto | Médio | Pendente |
| 2.2 | Score de confiança por pergunta pendente | Médio | Médio | Pendente |

**Detalhe — 2.1 AI Draft:**

Hoje:
```
Pergunta escalada → textarea vazia → RH escreve do zero (lento)
```

Com o agente:
```
Pergunta escalada → Claude rascunha usando KB + respostas treinadas
                  → textarea pré-preenchida → RH revisa em segundos
                  → Salvar e treinar (1 clique)
```

Implementação 100% browser: botão "Sugerir com IA" no card de pergunta pendente. Chama Claude com prompt especializado de consultor RH. Preenche a textarea. RH valida.

---

### Fase 3 — Estado compartilhado (sem backend)
> **Meta:** Múltiplos usuários/dispositivos vendo os mesmos dados.

| # | Item | Impacto | Esforço | Status |
|---|------|---------|---------|--------|
| 3.1 | Supabase (substituir localStorage) | Muito Alto | Médio | Pendente |
| 3.2 | Auth básica no admin (Supabase RLS) | Alto | Médio | Pendente |
| 3.3 | Email notification via Resend (browser SDK) | Alto | Baixo | Pendente |

**Detalhe — 3.1 Supabase:**
- SDK JS funciona 100% no browser, sem servidor
- Tabelas: `pending_questions`, `trained_answers`, `kb_gaps`
- RLS garante que anônimos só leem, admins escrevem (via token ou email magic link)
- Supabase Realtime: painel admin atualiza ao vivo quando chega nova pergunta

---

### Fase 4 — KB viva e auto-evolução
> **Meta:** Base de conhecimento que evolui com o uso, sem intervenção manual constante.

| # | Item | Impacto | Esforço | Status |
|---|------|---------|---------|--------|
| 4.1 | KB editável pelo admin (não mais hardcoded no HTML) | Alto | Alto | Pendente |
| 4.2 | RAG com pgvector (Supabase) — substitui KB no system prompt | Muito Alto | Alto | Pendente |
| 4.3 | Sugestão automática de novos conteúdos para a KB | Alto | Alto | Pendente |

**Detalhe — 4.2 RAG:**
- KB deixa de ser uma string gigante no system prompt (hoje ~777 linhas)
- Vira busca semântica: a pergunta do colaborador vira embedding, busca os N chunks mais relevantes, só esses vão pro contexto
- Resultado: respostas mais precisas, custo menor por query, KB pode crescer indefinidamente

---

## Backlog de melhorias menores

- [ ] Keyboard shortcut para abrir/fechar admin (ex: `Ctrl+Shift+A`)
- [ ] Contador de caracteres no textarea do admin
- [ ] Markdown completo no chat (listas, links clicáveis melhores)
- [ ] Loading state mais informativo ("Zi está consultando a base...")
- [ ] Modo escuro
- [ ] Exportar/importar trained answers como JSON (backup manual cross-device)
- [ ] Timestamp nas mensagens do chat
- [ ] Sugestões dinâmicas (baseadas nos temas mais perguntados, não estáticas)

---

## Métricas a acompanhar (quando tiver analytics)

| Métrica | Por que importa |
|---------|-----------------|
| Taxa de escalação | Mede eficácia da Zi. Meta: abaixo de 15% |
| Temas mais perguntados | Prioriza expansão da KB |
| Tempo médio de resposta do RH | Mede eficácia do admin + AI Draft |
| Taxa de reuso de respostas treinadas | Valida o loop de aprendizado |
| Queries por dia | Tração do produto |

---

## Perguntas em aberto

- [ ] Quem é o "admin RH"? Uma pessoa? Um time? Precisa de auth individual por pessoa?
- [ ] A KB atual (NV) é completa? Quais tópicos os colaboradores mais perguntam que ainda não estão cobertos?
- [ ] Depois da validação, o produto escala para outras marcas do Grupo Soma? (cada marca teria KB própria?)
- [ ] Existe um canal de comunicação oficial do RH (Teams, WhatsApp) onde a Zi poderia operar como um bot nativo?
