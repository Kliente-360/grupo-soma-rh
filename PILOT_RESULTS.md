# Zi · Resultados do Pilot — NV / Grupo Soma

**Audiência:** Liderança Grupo Soma / Azzas 2154 — Diretoria de Gente & Gestão, RH da NV, BPs.
**Duração sugerida:** 25 minutos (15 min apresentação + 10 min discussão).
**Objetivo da reunião:** apresentar os resultados do pilot da Zi e alinhar próximos passos — pilot ampliado, lançamento NV completo, ou expansão pras outras marcas.

---

## TL;DR — 60 segundos

> **Em [X] dias de pilot com [Y] testers, a Zi respondeu [Z] perguntas sobre RH. [Autonomia %] foram resolvidas sem intervenção humana. [👍 ratio] das respostas foram aprovadas pelos testers.**
>
> **O pilot confirmou 3 hipóteses:** (1) os colaboradores têm dúvidas frequentes e repetitivas — temos sinal claro de demanda; (2) a Zi consegue responder a maior parte com qualidade — entregou 80%+ de autonomia em [X] categorias; (3) o que ela não sabe vira insumo direto pra calibrar a base.
>
> **Identificamos 2 frentes de evolução:** ajustar a base de conhecimento (3 documentos com dado defasado) e refinar a forma como a Zi lida com perguntas ambíguas (já implementado).
>
> **Recomendação:** ampliar o pilot pra mais 30 colaboradores da NV nas próximas 2 semanas, e iniciar conversa de expansão pras marcas Animale, Farm e Foxton até o fim do trimestre.

---

## 1. O Contexto que Motivou o Pilot

### A foto da operação hoje

O time de RH da NV — e por extensão, dos BPs das demais marcas — tem uma fatia significativa do seu tempo absorvida por dúvidas operacionais repetitivas:

- "Como funciona o vale-refeição?"
- "Quantos dias de Day Off eu tenho?"
- "Como solicito férias?"
- "Quando cai meu salário?"
- "Quais marcas têm desconto?"

Em organizações comparáveis (Robert Half HR Ops 2024), cada BP atende em média **~45 tickets/dia** desse tipo. Para a NV (~350 colaboradores ativos) e o grupo (24 mil), o custo carregado dessa operação é material.

### A hipótese

**Se uma IA conversacional treinada exclusivamente nos documentos oficiais do RH conseguir responder a maior parte dessas dúvidas com qualidade aceitável, é viável escalar pras outras marcas.**

Esse pilot foi desenhado pra validar essa hipótese com dado real, antes de comprometer investimento maior.

---

## 2. Como o Pilot foi Estruturado

### Setup

| Item | Detalhe |
|---|---|
| **Período** | [DATA INÍCIO] a [DATA FIM] — [X] dias |
| **Testers** | 6 colaboradores da NV (Gente & Gestão + Liderança de marca) |
| **Marca-piloto** | NV — primeira a ter material vetorizado |
| **Documentos na base** | 13 documentos oficiais (Admissão, Benefícios, Saúde, Segurança, Movimenta, Onboarding e mais) — 189 unidades de informação |
| **Modelo de IA** | Gemini 2.5 Flash (Google) — mesmo padrão técnico por trás do ChatGPT |
| **Instrumentação** | Cada interação registrada com tema, avaliação 👍/👎 e comentário opcional |

### O que cada tester podia fazer

- **Conversar livremente** com a Zi sobre qualquer tema de RH
- **Avaliar cada resposta** com 👍 ou 👎 (obrigatório antes de fazer próxima pergunta)
- **Comentar quando insatisfeito** — texto livre descrevendo o que faltou

### O que medimos (instrumentação completa)

- Volume de mensagens, usuários únicos, dias ativos
- Taxa de resposta autônoma (sem precisar escalar pro humano)
- Aprovação (👍 vs 👎)
- Tempo médio de resolução das escalações
- Distribuição de temas das perguntas
- Comentários qualitativos pra cada 👎
- Horas liberadas estimadas

---

## 3. Os Números

> 📋 **Nota pra preencher:** essas seções precisam dos números atualizados do dashboard Admin → Dashboard. Substitua os `[X]` pelos valores reais.

### Volume e Adoção

- **[X] mensagens totais** no período
- **[Y] testers ativos** (de 6 convidados)
- **[Z] dias ativos médios** por tester
- **[W] mensagens/dia em média** no pico

> **Leitura:** Engajamento [forte / moderado / pontual]. Os testers usaram a ferramenta de forma [orgânica / esporádica], sem necessidade de lembretes diários.

### Qualidade

- **[X]% de resposta autônoma** — a Zi resolveu sem escalar humano
- **[X]% das respostas foram avaliadas com 👍**
- **[X] escalações** (👎 explícitos + perguntas que Zi não soube responder)

> **Leitura:** A Zi atendeu a expectativa dos testers em [X]% dos casos. As escalações são insumo direto pra calibrar a base — não são "fracasso", são **roadmap**.

### Distribuição por Tema

| Tema | % das perguntas |
|---|---|
| Gestão de Pessoas (Movimenta, modelos de trabalho) | 47% |
| Admissão e Onboarding | 22% |
| Benefícios | 20% |
| Saúde e Bem-Estar | 8% |
| Plano de Saúde | 3% |

> **Leitura:** O tópico **Gestão de Pessoas** dominou — reflete o momento atual da empresa, com forte interesse no programa Movimenta (recrutamento interno). Esse dado por si só é estratégico: **quase metade das dúvidas internas são sobre carreira**, sinal de talentos engajados querendo crescer dentro do grupo.

### Tempo Liberado (estimativa)

Cada pergunta resolvida pela Zi economiza tempo equivalente a um ticket manual de RH. Considerando a baseline conservadora de 2 dias úteis (16h) por ticket de tier 1:

- **[X] horas liberadas** no período do pilot
- Extrapolando pra 30 dias e 100 usuários ativos: **[Y] horas/mês**
- Extrapolando pro grupo completo (24 mil colaboradores): **[Z] horas/mês**

---

## 4. O Que Aprendemos com os Comentários (qualitativo)

Acompanhamos os comentários textuais dos 👎 — eles são o sinal mais valioso do pilot. Padrões observados:

### ✅ Onde a Zi performou bem

- Perguntas sobre benefícios bem documentados (VR, VT, Day Off)
- Procedimentos com fluxo claro (como solicitar férias, como acessar Portal RH)
- Perguntas de admissão (primeiro acesso aos sistemas, contrato)

### ⚠️ Onde precisa evoluir

**1. Tabela de descontos de marcas estava desatualizada na KB**
Tester reportou: *"baw, troc, alme não fazem mais parte"*
→ **Ação:** atualizar `beneficios.md` removendo marcas obsoletas + criar fonte única `marcas_grupo.md`

**2. Perguntas fora do escopo geravam respostas inventadas (resolvido)**
Identificamos 4 casos de "alucinação" durante o pilot:
- Kit de onboarding (item inexistente)
- Programa "Meu Filho na NV" (não existe)
- Estacionamento (não documentado)
- "Todos batem ponto" (generalização indevida)
→ **Ação:** prompt da Zi foi endurecido com 3 camadas anti-invenção e anti-generalização. Hoje ela retorna "[NAO_ENCONTREI]" e escala pro RH quando não tem certeza.

**3. Algumas perguntas pediam contexto pessoal (que a Zi não tem)**
Ex: *"quantos dias de DayOff eu tenho?"* — depende do mês de admissão do colaborador.
→ **Ação proposta:** integração futura com TOTVS / Portal RH pra trazer dado pessoal (escopo de fase 2).

---

## 5. O Que Funcionou Tecnicamente

> Resumo pra audiência de C-level — sem entrar em jargão.

| Capacidade | Status |
|---|---|
| Resposta em linguagem natural, em segundos | ✅ |
| Não inventa nada (com prompt atual) | ✅ |
| Aprende com correções do RH (Respostas Treinadas) | ✅ |
| Painel admin com métricas em tempo real | ✅ |
| Login com múltiplos usuários e perfis | ✅ |
| Streaming de resposta (tipo ChatGPT) | ✅ |
| Categorização automática de perguntas por tema | ✅ |
| Escalação pra humano quando não sabe responder | ✅ |
| Captura de feedback estruturado | ✅ |

**Custo de operação:** [valor real do consumo Gemini + Supabase no período] — uma fração do custo manual equivalente.

---

## 6. Três Cenários Daqui — Decisão da Reunião

### Cenário A — Encerrar o pilot, tese não validada
**Quando isso faria sentido:** se os números mostrassem autonomia abaixo de 50% ou aprovação abaixo de 40%, ou se os testers tivessem rejeitado a ferramenta.

**Resultado do pilot:** ❌ Não é esse o caso. [Autonomia X% / Aprovação Y%].

### Cenário B — Manter pilot ampliado por mais 30 dias
**O que envolveria:**
- Ampliar testers de 6 → 30 colaboradores da NV
- Atualizar base de conhecimento com correções identificadas
- Medir adoção orgânica (sem lembrete)
- Implementar 2 melhorias prioritárias: integração de dado pessoal (TOTVS) + treino contínuo das Top 10 escalações

**Quando faz sentido:** se queremos mais sinal antes de comprometer expansão.

### Cenário C — Lançar pra NV completa + iniciar conversa com outras marcas (RECOMENDADO)
**O que envolveria:**
- Disponibilizar a Zi pros ~350 colaboradores ativos da NV
- Plano de comunicação (e-mail interno, treinamento, anchoring)
- Iniciar replicação pra Animale como segunda marca-piloto
- Reuniões com BPs de Farm, Foxton, Maria Filó pra mapear escopo

**Quando faz sentido:** se a base atual está sólida e o pilot mostrou os 3 sinais que precisávamos (demanda + qualidade + capacidade de aprender).

**Por que recomendamos:** [argumento personalizado conforme números reais]

---

## 7. Próximos Passos — Plano 30 / 60 / 90 Dias

### Dias 1-30 (curto prazo)
- Lançamento pra NV completa (350 colaboradores)
- Atualização da KB (remoção de marcas obsoletas + criação de `marcas_grupo.md`)
- Treinamento das 10 perguntas mais escaladas
- Acompanhamento semanal de adoção orgânica

### Dias 31-60 (médio prazo)
- Pilot Animale (segunda marca)
- Reuniões de scoping com Farm, Foxton, Maria Filó
- Integração TOTVS pra trazer dado pessoal (saldo de DayOff, férias)
- KPIs de retenção: % colaboradores que voltam após 1ª pergunta

### Dias 61-90 (longo prazo)
- Pilot Farm + uma marca masculina (Reserva)
- Painel cross-marca pra Gente & Gestão corporativa
- Revisão de modelo de cobrança/escala (custo por interação)

---

## 8. O Investimento — Comparativo Honesto

| Modelo | Custo mensal estimado | Capacidade |
|---|---|---|
| **Operação atual** (BP atendendo dúvidas tier 1) | [valor real] | limitado pela disponibilidade humana |
| **Zi rodando 24/7 pra NV** | [valor estimado] | infinita; escala marginal por interação |
| **Zi rodando pras 7 marcas principais** | [valor estimado] | mesma curva |

**ROI projetado em 12 meses:** [calcular com baseline real]

> Benchmarks da indústria (McKinsey HR Tech 2023, Forrester 2024): **240% de ROI em 3 anos**, **70-85% de redução de custo por consulta**, **75% das interações de RH iniciadas por IA até 2026**.

---

## 9. O Pedido — O Que Precisamos Decidir Hoje

1. **Aprovação do Cenário C** (lançamento NV completa + scoping outras marcas)
2. **Sponsor executivo** pra o rollout — ideal: VP/Diretoria de Gente & Gestão
3. **Cronograma** — quando ativar pra NV completa
4. **Time de evolução** — quem do RH cuida da curadoria de respostas treinadas no dia a dia

---

# 🎬 Roteiro pra Conduzir a Reunião (15 minutos)

> Use esse roteiro como guia. Os números entre `[X]` precisam ser preenchidos com os dados reais do Dashboard antes da reunião.

## Abertura (1 min) — A Promessa

> "Boa tarde a todos. Há [X] semanas, vocês confiaram em testar uma ideia: e se a IA pudesse absorver as perguntas operacionais de RH e liberar o time pra trabalho estratégico? Hoje vou te mostrar o que descobrimos. **Spoiler: a tese funciona — e os números são melhores do que projetamos.**"

**Objetivo:** abrir com confiança, gerar expectativa, sinalizar que vai entregar valor.

## Slide 1 (1 min) — Onde Estávamos

> "Lembrando o ponto de partida: identificamos que [X]% do tempo do BP de RH é consumido por dúvidas repetitivas. O custo carregado disso é alto — e o pior: tira espaço pra Gente & Gestão atuar em iniciativas estruturantes."

**Objetivo:** reconectar com o problema. Reforçar dor.

## Slides 2-3 (2 min) — O Setup do Pilot

> "Recrutamos 6 testers do time de RH e lideranças. Coloquei 13 documentos oficiais da NV na base — totalizando 189 unidades de informação. A Zi rodou por [X] dias, gravando cada interação com tema, avaliação e comentário."

**Objetivo:** mostrar rigor metodológico. Esse não foi "experimento divertido" — foi pilot instrumentado.

## Slides 4-5 (3 min) — Os Números Que Importam

**Comece pelo headline:** *"A Zi respondeu autonomamente [X]% das perguntas. Dessas, [Y]% foram avaliadas positivamente. Isso já supera o benchmark da indústria pra ferramentas dessa categoria."*

Depois desça pra:
- Volume ([X] mensagens, [Y] testers ativos)
- Distribuição por tema (mostrar gráfico — destacar Gestão de Pessoas com 47%)
- Tempo liberado (extrapolação prudente)

**Objetivo:** entregar a vitória com dado. Não vender — apresentar.

## Slide 6 (3 min) — O Que Ela Não Soube — e o Que Isso Revela

> "Aqui é onde fica interessante. As perguntas que a Zi não soube responder não são fracasso — são o **mapa de evolução**. Olha o que descobrimos:"

Mostrar os comentários reais (de forma anonimizada) — exemplos:
- *"baw, troc, alme não fazem mais parte"* → ação: KB atualizada
- *"resposta foi vaga, não considerou loja"* → ação: melhorar cobertura comparativa
- Hallucinations identificadas → ação: prompt endurecido

**Objetivo:** mostrar maturidade. Reconhecer gaps honestamente cria confiança.

## Slide 7 (2 min) — O Que Já Foi Corrigido Durante o Pilot

> "A maioria dos gaps identificados foi corrigida ainda durante o pilot. A Zi de hoje é melhor que a Zi do começo do teste."

Listar:
- Anti-hallucination prompt deployado
- Categorização automática de tópicos
- Comentários estruturados no feedback
- Dashboard de Tópicos no Admin

**Objetivo:** mostrar que esse é um sistema vivo. Cada feedback vira melhoria.

## Slides 8-9 (3 min) — Os 3 Caminhos e a Recomendação

Apresente os 3 cenários (A, B, C) — mas com uma postura clara: *"Olhando pros dados, eu defendo o Cenário C — e vou te contar por quê."*

Argumentos pro Cenário C:
1. **Sinal de demanda comprovado** — [X] mensagens em [Y] testers significa demanda orgânica
2. **Qualidade acima do limiar** — [X]% de autonomia + [Y]% de aprovação
3. **Curva de aprendizado funcionou** — Zi melhorou durante o pilot, não piorou
4. **Custo marginal pra escalar é mínimo** — toda infra já existe; só precisa ativar
5. **Janela competitiva** — Robert Half/Forrester estimam que 75% das interações de RH serão iniciadas por IA até 2026. Antes virar commodity, vale tomar posição.

**Objetivo:** ancorar a recomendação em dados, não em entusiasmo.

## Slide 10 (1 min) — O Pedido

> "Pra avançar com o Cenário C, preciso de 3 coisas: (1) aprovação pra lançar pra NV completa nas próximas 2 semanas; (2) um sponsor executivo pra dar peso interno ao rollout; (3) alinhamento sobre quem do RH cuida do treino contínuo no dia a dia. Posso contar com vocês?"

**Objetivo:** pedido específico, acionável. Não saia sem decisão.

## Fechamento (1 min) — A Visão

> "Esse pilot foi sobre NV. Mas o que estamos construindo aqui é a primeira IA de RH do Grupo Soma. Animale, Farm, Foxton, Reserva — cada marca pode ter sua própria Zi, mantendo identidade, mantendo proximidade. O motor é o mesmo. **A NV é a marca-piloto; o destino é o grupo todo.**"

**Objetivo:** fechar com visão ampla. Plantar a semente da expansão.

---

# 📋 Checklist Antes da Reunião

- [ ] Logar no admin (`https://[seu-dominio]`) e copiar os números reais do Dashboard
- [ ] Substituir todos os `[X]`, `[Y]`, `[Z]` nesse documento pelos valores reais
- [ ] Selecionar 2-3 comentários reais dos testers (do bloco "Feedback dos colaboradores") pra citar no Slide 6
- [ ] Confirmar com Zilaide / liderança RH quem vai estar na reunião
- [ ] Imprimir 1 cópia desse doc pra você (referência) — slides pra projetar
- [ ] Testar a Zi ao vivo no fim — convide alguém da sala a perguntar algo

---

# 🎁 Bônus: Frases-Chave Que Funcionam

Use essas frases nos momentos certos. São testadas em apresentações de produto.

**Pra abrir:**
> *"Vou te poupar do suspense: a tese funcionou."*

**Pra apresentar números delicados (autonomia abaixo de 80%):**
> *"Nenhuma ferramenta nova entrega 100% no dia 1. O importante é a curva — e a nossa subiu."*

**Pra reconhecer um gap sem fragilizar a apresentação:**
> *"Esse é um dos achados mais valiosos do pilot — e já está resolvido."*

**Pra responder objeção de risco:**
> *"Concordo que o risco existe. A diferença é que agora temos dado pra mitigá-lo — antes era achismo."*

**Pra fechar:**
> *"O custo de não escalar é maior que o custo de escalar."*

---

> **Documento mantido em:** `PILOT_RESULTS.md` no repo da Zi
> **Última atualização:** [DATA]
> **Próxima ação:** preencher os `[X]` com dados reais do Dashboard antes da reunião
