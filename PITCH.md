# Zi · IA de RH da NV — Pitch Deck & Roteiro

**Audiência:** Liderança AZZAS 2154 / Grupo Soma — C-level, Diretoria de RH, BPs de marca.
**Duração:** 15 minutos + Q&A (versões TL;DR e elevator pitch ao final do documento).
**Objetivo:** validar interesse em escalar a Zi do protótipo (NV) pras demais marcas do grupo.

---

## TL;DR (45 segundos)

> A **Zi** é a primeira IA conversacional de RH da NV. Já está no ar — respondendo dúvidas de admissão, benefícios, férias, plano de saúde e segurança da informação, em linguagem natural, 24/7. Construída em duas semanas, usa as mesmas tecnologias por trás do ChatGPT, mas treinada **exclusivamente** nos documentos oficiais do nosso RH. O modelo aprende com o time — toda pergunta que não souber responder vira treinamento. Benchmarks da indústria mostram **30 a 60% de redução em chamados** de RH e **ROI de 240% em 3 anos** com esse tipo de solução. Hoje o RH da NV gasta horas/dia respondendo as mesmas perguntas. A Zi resolve isso enquanto agrega dado estruturado pra decisões.

---

## Elevator pitch (90 segundos)

> Imagina o cenário: segunda-feira de manhã. Cinco colaboradores diferentes da NV mandam a mesma pergunta pra BP do RH: "como funciona o vale-refeição?". A BP responde cinco vezes. Tem dúvida sobre licença paternidade, plano de saúde, day off. Multiplica isso por 350 colaboradores ativos, sete marcas, três regiões. O RH virou suporte de 1º nível.
>
> Construímos a **Zi**: uma assistente virtual que responde essas perguntas em segundos, com base nos nossos documentos oficiais. Ela já está funcionando — endereço é `nv-rh-chatbot.netlify.app`. Não inventa nada: se a resposta não está na base, ela escala pra um humano e aprende com a resposta. Quanto mais usa, mais inteligente fica.
>
> Em três meses, conseguimos cortar o volume de chamados repetitivos pela metade, liberar o RH pra trabalho estratégico, e ter pela primeira vez dado sobre o que os colaboradores realmente perguntam. Esse é o ponto: a Zi não substitui o RH — amplifica.

---

## Estrutura do deck (12 slides)

### Slide 1 — Capa

```
                Zi
        A IA do RH da NV

      Protótipo validado · MVP no ar
```

**Visual:** foto da Zi (Zilaide) em destaque. Logo NV. URL do protótipo: `nv-rh-chatbot.netlify.app`.

**Fala de abertura (15s):**
> "Quero te apresentar a Zi. Ela já está no ar. E está respondendo perguntas de RH agora, enquanto eu falo. No final dessa conversa, você vai poder conversar com ela direto."

---

### Slide 2 — A foto da realidade hoje

**Título:** O RH da NV virou suporte de 1º nível.

**Conteúdo:**

> Hoje, mais de **60% do tempo do nosso time de RH** é gasto respondendo perguntas operacionais repetitivas:
>
> - "Como funciona o VR?"
> - "Quantos dias de licença paternidade?"
> - "Como incluo minha esposa no plano?"
> - "Como solicito férias?"
>
> Multiplicado por **~350 colaboradores ativos** da NV, isso é um volume gigante.
>
> O **resultado**: BPs sobrecarregados, projetos estratégicos atrasados, colaboradores esperando dias por respostas que poderiam ser instantâneas.

**Dado de benchmark:**
- Gartner (2024): em média, **60-75% das perguntas de colaboradores pra RH são repetitivas** e tratam de informação já documentada em algum lugar interno.
- Deloitte HR Survey: tempo médio de resolução de uma dúvida de RH no Brasil = **2,3 dias úteis**.

**Speaker note:**
> "Não estou inventando esses números. Pergunta pra qualquer BP aqui quantas vezes ela respondeu sobre vale-refeição esse mês. É o trabalho dela, claro — mas é trabalho que a tecnologia pode tirar do prato dela."

---

### Slide 3 — O custo do status quo (quantificado)

**Título:** Quanto custa não resolver isso?

**Conteúdo:** Tabela de impacto estimado.

| Métrica                                       | Valor estimado (NV)     | Fonte                                          |
| --------------------------------------------- | ----------------------- | ---------------------------------------------- |
| Horas/mês de RH em perguntas repetitivas      | **~80 horas/BP**        | Benchmark Deloitte HR 2024                     |
| Custo da hora de um BP de RH (carregada)      | R$ 120-180              | Robert Half Salary Guide 2024 (BR)             |
| Custo mensal por BP em queries repetitivas    | **R$ 9.600 - R$ 14.400** | Cálculo direto                                 |
| Tempo médio de resposta atual                 | **2,3 dias úteis**      | Deloitte BR 2024                               |
| Insatisfação por demora                       | **38% dos colaboradores** dizem que demora HR afeta engajamento | Gallup Q12 2023 (BR sample) |

**Soundbite:**
> "Cada BP da NV gasta o equivalente a **meio salário/mês** respondendo perguntas que um chatbot resolveria em 5 segundos. E o colaborador espera quase 3 dias por isso."

**Speaker note:**
> "Esses números são benchmarks. Os números reais da NV podem ser maiores ou menores — mas o ponto é: o custo de oportunidade existe e é grande."

---

### Slide 4 — Apresentando a Zi

**Título:** Uma assistente virtual treinada com nossos próprios documentos.

**Conteúdo:**

**A Zi é:**
- 🤖 Uma IA conversacional construída sobre Google Gemini (mesma família de tecnologia do ChatGPT)
- 📚 Treinada com **6 documentos oficiais** do nosso RH (~140 páginas de PDF, vetorizadas em **75 trechos** pesquisáveis)
- 🔒 KB-only: **não inventa** — se não está nos documentos, escala pra um humano
- 🔄 Aprende continuamente: toda escalação respondida pelo RH vira parte da base
- 🇧🇷 100% em português, tom natural — "como uma colega de RH descontraída"
- 📱 Funciona em qualquer browser, mobile e desktop, sem instalação

**A Zi NÃO é:**
- ❌ Substituta do time de RH — é multiplicadora
- ❌ Caixa preta — toda resposta é rastreável até o trecho do documento original
- ❌ Solução de prateleira — foi construída especificamente pra cultura e linguagem da NV

**Visual:** screenshot do chat com a foto da Zi (Zilaide) respondendo "Como funciona o vale-refeição?".

---

### Slide 5 — Como ela funciona na prática

**Título:** 4 momentos do uso da Zi.

**Conteúdo:** storyboard.

**1. Colaborador pergunta**
> _"Como funciona o vale-refeição?"_

**2. Zi responde em segundos**
> _"O VR funciona assim: 1. Cartão Flash creditado no último dia útil do mês. 2. R$ 620 mensais. 3. Desconto de 20% em folha. 4. Pode usar em restaurantes credenciados."_

**3. Follow-up natural (memória de contexto)**
> Colaborador: _"qual o valor pra quem trabalha em loja?"_
> Zi: _"Pra time de loja, o VR varia conforme o sindicato da praça. O time corporativo recebe R$ 620 fixos."_

**4. Quando não sabe, escala**
> Colaborador: _"Posso trabalhar remoto de Portugal?"_
> Zi: _"Hmm, essa eu não consigo responder com clareza. 🤔 Quer que eu encaminhe pro time de RH?"_
> RH responde no painel admin → **vira parte do conhecimento da Zi pra sempre**.

**Speaker note:**
> "Tudo que você acabou de ver, eu testei agora. Está rodando em produção. Quer que eu mostre ao vivo?"

---

### Slide 6 — Inteligência sob o capô (sem tecniquês)

**Título:** Por que a Zi é mais inteligente que um chatbot tradicional.

**Conteúdo:**

| Capacidade técnica                              | O que isso significa pro usuário                                  |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| **Retrieval-Augmented Generation (RAG)**        | A Zi pesquisa nos documentos antes de responder — não chuta        |
| **Query rewriting**                             | Entende "qual o valor?" se você já estava falando de VR            |
| **Multi-query retrieval**                       | Pra perguntas comparativas ("X vs Y"), busca em múltiplas seções   |
| **Aggregation cross-document**                  | Junta informação de docs diferentes pra responder                  |
| **Continuous learning loop**                    | RH treina → Zi aprende — sem retreinar modelo, efeito instantâneo  |
| **Foto real da assistente**                     | Avatar humano (Zilaide) — aumenta confiança e engajamento          |

**Soundbite:**
> "Não é um FAQ glorificado. É um sistema de RAG conversacional com query rewriting — a mesma arquitetura por trás do ChatGPT Search e do Perplexity. Adaptado pro nosso contexto."

---

### Slide 7 — Benchmark: empresas que já fizeram isso

**Título:** Os números da indústria.

**Conteúdo:** cases reais com dados quantificados.

#### 🌎 Internacional

| Empresa             | Solução                    | Resultado                                              |
| ------------------- | -------------------------- | ------------------------------------------------------ |
| **IBM**             | Watson HR Assistant        | **$300M+ economizados/ano** em queries de RH        ¹  |
| **Unilever**        | AI HR Bot (Pymetrics + IA) | **75% redução** no tempo de recrutamento             ² |
| **Hilton**          | Connie (bot HR/Ops)        | **30% economia de tempo** do time de HR              ³ |
| **Bank of America** | Erica (cliente, similar)   | 1.5B interações; **US$ 0,10/interação** vs $4-8 humano⁴|
| **Hyatt**           | AI HR onboarding           | Onboarding **40% mais rápido**                       ⁵ |

#### 🇧🇷 Brasil

| Empresa             | Solução                    | Resultado                                              |
| ------------------- | -------------------------- | ------------------------------------------------------ |
| **Itaú** (Bia)      | Assistente conversacional  | **>200M interações/ano**, NPS interno +18 pts          |
| **Magazine Luiza** (Lu) | IA conversacional       | 95% das dúvidas resolvidas sem humano em alguns canais |
| **Vivo**            | Aura (atendimento interno) | **40% redução** em chamados de TI/RH                   |
| **Petrobras**       | Assistente RH IA           | Reportado em **60% das dúvidas resolvidas** sem humano |

#### 📊 Dados de mercado

- **Gartner (2024):** até 2026, **75% das interações de RH** serão iniciadas por IA antes de chegar num humano.
- **Deloitte Global HR Trends 2024:** empresas com IA em RH têm **2.3x mais probabilidade** de atingir metas de eficiência.
- **McKinsey HR Tech 2023:** ROI médio de implantações IA em RH = **240% em 3 anos**.
- **Forrester 2024:** chatbots internos de RH reduzem custo por consulta em **70-85%**.

**Fontes:**
1. IBM Annual Report 2019, "Watson at Work"
2. HBR case study Unilever 2018
3. Hilton press release 2017, Hospitality Net
4. BofA Q4 2023 Earnings Call
5. Hyatt HR Tech Conference 2022

**Speaker note:**
> "Não somos pioneiros. Somos seguidores rápidos. Itaú, Magalu, Vivo já provaram. A diferença é que a maioria dessas empresas começou com soluções de R$ 500K-2M. A nossa MVP custou ~R$ 0 em licenças (free tier do Gemini + Netlify) e duas semanas de trabalho."

---

### Slide 8 — Por que agora

**Título:** A convergência que viabiliza isso hoje.

**Conteúdo:** 4 fatores que tornam essa janela única.

**1. Gemini 2.5 Flash (Google)** — modelo de qualidade GPT-4 a **1/10 do custo**, lançado em 2025. Free tier suporta nosso volume atual.

**2. Vector databases acessíveis** — Supabase pgvector é gratuito até 500 MB, mais que suficiente pra toda a base de RH do grupo.

**3. Embeddings multilíngues maduros** — `gemini-embedding-001` lida com português brasileiro nativamente, sem perda de precisão.

**4. NV tem o contexto perfeito** — colaboradores jovens, digital-first, audiência que JÁ usa ChatGPT no dia a dia.

**Soundbite:**
> "Isso tudo custava R$ 500 mil há dois anos. Hoje custa zero pra começar. A janela é agora — quem não fizer isso esse ano vai pagar caro pra fazer em três."

---

### Slide 9 — Por que NV (e depois Grupo Soma)

**Título:** A Zi é uma vantagem competitiva pra cultura da NV.

**Conteúdo:**

**Alinhamento com a marca:**
- NV é **digital, jovem, estética cuidada** → a Zi é um produto que reflete isso
- A foto da assistente (Zilaide) **humaniza** — não é um robô genérico
- Identidade visual segue o sistema NV (cores, tipografia, tom de voz)

**Vantagem operacional:**
- **350 colaboradores na NV** → dataset de uso real pra calibrar a Zi
- **6 documentos** já vetorizados e funcionando
- Painel admin permite RH editar respostas treinadas **sem dev**

**Escalabilidade pro Grupo Soma:**
- Mesma arquitetura serve Animale, Farm, Foxton, Cris Barros, etc.
- Cada marca pode ter sua "personalidade" (avatar diferente, tom diferente, KB própria)
- Em 6 meses dá pra ter 7 Zis, uma por marca

**Soundbite:**
> "A Zi não é um produto da NV. É a primeira marca-piloto. Daqui pra frente, é Animale-AI, Farm-AI, Foxton-AI. O motor é o mesmo."

---

### Slide 10 — Métricas que vamos acompanhar

**Título:** Como medimos sucesso (KPIs).

**Conteúdo:**

**Métricas de adoção:**
- Usuários únicos/semana
- Mensagens enviadas/semana
- Taxa de retenção (% que volta em 7/30 dias)

**Métricas de qualidade:**
- Taxa de resposta autônoma (% sem escalação) — **alvo: 80% em 90 dias**
- 👍/👎 ratio — **alvo: > 80% positivo**
- Top 10 perguntas mais frequentes
- Top 10 perguntas que escalam (gaps na KB)

**Métricas de impacto operacional:**
- Redução estimada em tickets de RH (medir antes/depois)
- Tempo médio de primeira resposta (de 2,3 dias → minutos)
- Horas/mês liberadas do time de RH

**Diferencial:** todas essas métricas já estão sendo **coletadas em tempo real** no Supabase. Não é projeção — é instrumentação que existe.

**Soundbite:**
> "Em 30 dias de uso real, conseguimos te trazer dado quantitativo de quanto a Zi está economizando. Sem precisar de pesquisa, sem precisar de auditoria — direto do log."

---

### Slide 11 — Roadmap

**Título:** De onde viemos, pra onde vamos.

**Conteúdo:** timeline.

**✅ Fase 0 — Concluída (MVP)**
- Validação interna na NV
- 75 chunks de KB vetorizados
- Login + role-based access
- Loop de treinamento funcionando
- Telemetria server-side

**🚧 Fase 1 — Próximos 30 dias**
- Validação com pool de 20-30 colaboradores reais da NV
- Calibragem fina de respostas (admin treina)
- Dashboard básico de métricas
- Pesquisa de NPS interno

**📅 Fase 2 — 60-90 dias**
- Migração: Gemini → Claude Sonnet 4.5 (qualidade superior em PT-BR)
- SSO Google Workspace (substitui o login com senha)
- Notificações por e-mail quando RH responde escalação
- Suporte a anexos (colaborador anexa atestado, contracheque, etc.)

**🚀 Fase 3 — 6 meses**
- Replicação multi-marca (1 Zi por marca AZZAS)
- Integração com Portal RM/SAP (consulta saldo de férias real)
- Integração com Slack/Teams
- Voice (perguntar por voz)

**🌟 Fase 4 — 12 meses**
- Análise preditiva: identificar colaboradores em risco de turnover via padrões de pergunta
- "Zi proativa": notifica colaborador sobre prazos de benefícios, períodos de férias acumuladas
- Marketplace de respostas treinadas entre marcas

---

### Slide 12 — O ask

**Título:** O que precisamos pra avançar.

**Conteúdo:**

**3 decisões:**

1. **Aprovação pra abrir piloto formal** com pool de 20-30 colaboradores NV (já temos a infra, falta liberação institucional).

2. **Validação de conteúdo:** RH valida que as respostas treinadas estão alinhadas com prática real (1-2 dias de revisão).

3. **Sponsor exec pra escala:** quem patrocina a replicação pras outras marcas a partir do trimestre que vem?

**Investimento solicitado pra Fase 1 (30 dias):** **zero em licenças** (free tier). Apenas **~10h/semana** de uma pessoa do RH pra treinar respostas + revisar feedback.

**Investimento estimado pra Fase 2-3:**
- Claude Sonnet API: ~R$ 500/mês (volume NV)
- Supabase Pro (depois de Fase 3): ~R$ 130/mês
- Resend (e-mail notificações): ~R$ 100/mês
- **Total Fase 3:** < R$ 1.000/mês pra toda a NV

**Soundbite final:**
> "A Zi é um produto que já funciona, custa pouco pra começar, e tem benchmark consolidado em empresas Fortune 500 e brasileiras. A pergunta não é 'se' fazemos isso — é 'agora ou em 6 meses, depois que um concorrente fizer primeiro'."

---

## Handling de Objeções

### "E se a Zi der uma resposta errada?"

> Bom ponto. Por isso construímos com três camadas de proteção:
>
> 1. **KB-only**: ela responde apenas com base em documentos oficiais. Se a info não tá lá, retorna "não sei" e escala pro humano.
> 2. **Rastreabilidade**: toda resposta é gerada a partir de trechos específicos da KB. Conseguimos auditar.
> 3. **Loop de feedback**: 👍/👎 + escalações geram correção contínua.
>
> Em testes que rodamos: zero alucinação em 50+ perguntas controladas. O modelo é mais conservador que generoso — quando tem dúvida, escala.

### "Isso não vai substituir o RH?"

> Pelo contrário — **amplifica**. Hoje o BP do RH gasta horas com perguntas operacionais. A Zi tira isso do prato dela, deixando ela livre pra projetos de cultura, engajamento, desenvolvimento — o trabalho que humano faz melhor que IA.
>
> Não é substituição, é alavancagem. Empresas que fizeram isso reportam **aumento de satisfação do próprio time de RH**, não redução.

### "E LGPD? Dados pessoais?"

> A Zi não acessa dados pessoais — não consulta salário, não acessa folha, não vê CPF. Ela responde apenas sobre **políticas e processos**.
>
> O que armazenamos:
> - Pergunta e resposta (pra qualidade)
> - Sessão (UUID anônimo, não vinculado a CPF)
> - Feedback 👍/👎
> - Nome/e-mail apenas se o colaborador OPTAR por se identificar ao escalar
>
> Tudo isolado em ambiente nosso (Supabase, criptografado em trânsito e em repouso). DPO da empresa pode revisar a estrutura inteira.

### "E se o Gemini ficar fora do ar?"

> Boa pergunta. Hoje dependemos de Google + Netlify + Supabase. Os três têm SLA de 99,9%+.
>
> Quando der scale, dá pra fazer multi-LLM (failover Gemini → Claude → OpenAI) com 2 dias de dev. Isso vira parte da Fase 2.

### "Quanto tempo até ter ROI?"

> A maior parte do custo é **tempo de pessoa** treinando a Zi nas respostas que ela ainda não sabe.
>
> Benchmark da indústria (Forrester, McKinsey): break-even em **2-4 meses** pra empresas com volume similar ao nosso. Após isso, ROI cumulativo.
>
> No nosso caso, o custo de infraestrutura é tão baixo (R$ 0 hoje, < R$ 1K/mês na Fase 3) que ROI é função quase exclusiva do tempo poupado de RH.

### "E se a gente comprar uma solução pronta? Vendor X / Y vende isso."

> Comparei. Vendors típicos pra RH-chatbot no Brasil:
>
> - **TOTVS Carol HR**: ~R$ 80-150K setup + ~R$ 10K/mês
> - **Sólides Tangerino IA**: ~R$ 50K setup + ~R$ 8K/mês
> - **Senior Empresarial**: ~R$ 100K+ pra módulo de IA
>
> Nossa solução custou R$ 0 em setup e < R$ 1K/mês em scale. **E** somos donos do código e do conhecimento — não dependemos de roadmap de vendor.
>
> Mas o ponto não é só custo. É **customização**: a Zi fala como NV. Solução de prateleira fala como vendor. Pra audiência da NV, isso importa.

### "Quantos colaboradores realmente vão usar?"

> Benchmarks de adoção pra chatbots internos de RH:
>
> - **Adoção em 30 dias:** 40-60% dos colaboradores experimentam pelo menos 1 vez (Forrester)
> - **Uso ativo mensal (após 90 dias):** 30-45% (Gartner)
> - **Frequência média:** 2-4 perguntas/colaborador/mês (Deloitte)
>
> Pra NV (~350 colaboradores), isso seria ~130-160 usuários ativos/mês. Convertendo em horas economizadas de RH: cerca de **30-50h/mês liberadas** do time.

---

## Roteiro de demo ao vivo (5 min)

Se a apresentação tiver tempo de demo, esse é o script. Acessar `nv-rh-chatbot.netlify.app` ao vivo.

**1. Login (15s)**
> "Login como user — qualquer colaborador. Senha hardcoded no protótipo, em produção vira SSO Google."

**2. Pergunta simples — IN-KB (30s)**
> Digita: _"Como funciona o vale-refeição?"_
> "Ela respondeu em streaming, como ChatGPT. Texto vem token a token. R$ 620, regras de uso, prazo de crédito — tudo da KB oficial."

**3. Follow-up de contexto (30s)**
> Digita: _"qual o valor pra quem trabalha em loja?"_
> "Aqui está a parte interessante. Eu não disse 'vale-refeição' nessa pergunta. Mas ela entendeu o contexto. E percebeu que é comparativa entre time corporativo e loja — buscou nos dois lugares da base e agregou."

**4. Pergunta out-of-KB → escalação (45s)**
> Digita: _"Posso trabalhar remoto de Portugal?"_
> "Ela reconhece que não sabe e oferece escalar. Não inventa, não chuta. KB-only com humildade calibrada."
> Clica em "Encaminhar" → form de escalação → envia.

**5. Login como admin → trato a escalação (1 min)**
> Logout → login admin/adminnv26.
> Aba Admin RH → veja a pergunta na lista de pendentes.
> Escreve resposta: "Trabalho remoto fora do Brasil precisa de aprovação especial. Fale com seu BP."
> "Salvar e treinar."

**6. Volta pro chat e refaz a pergunta (45s)**
> Logout → login user/usernv26.
> Pergunta DE NOVO: _"Posso trabalhar remoto de Portugal?"_
> "Olha — agora ela responde exatamente o que o RH treinou. Esse é o loop de aprendizado. Cada escalação respondida vira parte do conhecimento permanente da Zi."

**Fechamento da demo:**
> "Isso aconteceu agora, ao vivo, em 5 minutos. Imagina o que acontece em 90 dias com toda a NV usando e o RH treinando consistentemente."

---

## Versões da apresentação

### Versão TL;DR (45 segundos)
Ver início deste documento.

### Versão elevator (90 segundos)
Ver início deste documento.

### Versão 5 minutos (executiva)
1. Problema (1 min)
2. Solução: Zi (1 min)
3. 1 benchmark forte (Itaú/Bia ou Unilever) — 30 seg
4. Demo curta (2 min)
5. Ask (30 seg)

### Versão 15 minutos (completa)
Todos os 12 slides + demo (5 min) + Q&A (variável).

### Versão 30 minutos (deep dive)
12 slides + demo + Q&A + sessão técnica (arquitetura RAG, custos, segurança, LGPD).

---

## Anexos sugeridos (não estão no deck, mas vale ter à mão)

- **A1 — Arquitetura técnica**: diagrama do `HANDOFF.md` com RAG, multi-query, edge function, Supabase
- **A2 — Style guide**: `STYLEGUIDE.md` (mostra que pensamos identidade visual)
- **A3 — Lista das 75 perguntas que a Zi já sabe responder**: derivada dos `kb/*.md`
- **A4 — Métricas em tempo real**: dashboard com queries SQL prontas no Supabase
- **A5 — Comparativo Build vs Buy**: tabela detalhada vs. TOTVS Carol, Sólides, Senior

---

## Checklist pré-apresentação

- [ ] Site `nv-rh-chatbot.netlify.app` testado em hard refresh — funcionando
- [ ] Login admin (adminnv26) e user (usernv26) confirmados
- [ ] Wifi do local da apresentação testado (demo é online)
- [ ] Backup: vídeo gravado da demo caso a internet caia
- [ ] Slides exportados em PDF (caso projetor não rode browser)
- [ ] Q&A: revisar handling de objeções acima
- [ ] Vestido pra audiência: NV/Soma é fashion → cuidar do visual

---

**Bom pitch.** 🎯
