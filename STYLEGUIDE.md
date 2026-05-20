# UI/UX Style Guide — NV Chatbot (Zi)

Esse documento alinha a experiência digital da Zi com a identidade premium, minimalista e contemporânea da NV. É a fonte de verdade do design system. Toda mudança visual deve passar por aqui antes de virar código.

**Audiência:** quem for mexer no `index.html`, criar variações da Zi em outros canais, ou auditar consistência visual.

---

## 1. Princípios de Design

### Editorial Luxury
Muito respiro entre elementos, hierarquia tipográfica forte e layout amplo, inspirado em revistas de moda e nas marcas-âncora do mundo NV (Aritzia, COS, The Row).

### Minimalist Friction
Remover decoração desnecessária. Conteúdo (a conversa, a foto da Zi) e a imagem da marca são o ponto focal. Sem gradientes vistosos, sem sombras chamativas, sem ilustrações cartunescas.

### Micro-Interactions com sofisticação
Transições rápidas (140-220ms), curvas suaves (sem bounce playful). Fade + slide estruturado, não molas. Feedback claro mas discreto.

---

## 2. Paleta de Cores (Tokens)

Os tokens vivem como CSS variables em `:root` no `index.html`.

| Token                   | Hex       | Uso                                                                | Tipo    |
| ----------------------- | --------- | ------------------------------------------------------------------ | ------- |
| `--color-brand-primary` | `#1A1A1A` | Texto principal, CTAs primárias, headers estruturais               | Core    |
| `--color-brand-accent`  | `#1B365D` | Bolhas do usuário, link, foco, ícones ativos, navy NV "Blue Matters" | Accent  |
| `--color-accent-soft`   | `#E4EAF2` | Backgrounds de tints (chip hover, focus ring)                      | Accent  |
| `--color-bg-main`       | `#FFFFFF` | Fundo da aplicação                                                 | Base    |
| `--color-bg-surface`    | `#F5F5F3` | Bolhas da Zi, cards, inputs, panels                                | Base    |
| `--color-bg-elevated`   | `#FAFAF8` | Surface secundária (empty state, gate)                             | Base    |
| `--color-border-subtle` | `#E0DCD3` | Linhas, bordas inativas, divisores                                 | Border  |
| `--color-border-strong` | `#C9C2B4` | Bordas hover, separadores enfatizados                              | Border  |
| `--color-text-primary`  | `#1A1A1A` | Texto de corpo, headings                                           | Text    |
| `--color-text-soft`     | `#3D3D3D` | Texto secundário, descrições, labels                               | Text    |
| `--color-text-muted`    | `#767676` | Timestamps, placeholders, hints                                    | Text    |
| `--color-success`       | `#1F6B47` | Feedback positivo (👍), states de sucesso                          | Semantic |
| `--color-danger`        | `#8B2E26` | Feedback negativo (👎), erros                                      | Semantic |

**Regras:**
- Nunca usar cor fora dessa tabela. Se faltar tom, adicionar aqui antes.
- Acento navy (`#1B365D`) é o **único** ponto de cor. Resto é preto/cinza/branco.
- Manter contraste WCAG AA mínimo em texto sobre superfícies.

---

## 3. Tipografia & Hierarquia

Stack pensada pra estrutura editorial. Inter como base universal (peso variável, ótima legibilidade), Helvetica Neue como fallback editorial em headers se quiser textura clássica.

- **Primary:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Secondary (editorial):** `Helvetica Neue`, `Arial`, `sans-serif`
- **Numerais tabulares onde fizer sentido:** `font-variant-numeric: tabular-nums`

### Escala tipográfica

| Token              | Tamanho / Line-height | Peso | Letter-spacing | Uso                                                |
| ------------------ | --------------------- | ---- | -------------- | -------------------------------------------------- |
| `--font-display`   | 40px / 48px           | 500  | -0.02em        | Splash / hero (não usado no chat hoje)             |
| `--font-h1`        | 26px / 32px           | 500  | -0.015em       | Título do header ("Zi · Assistente de RH")         |
| `--font-h2`        | 22px / 30px           | 500  | -0.01em        | Seções do admin                                    |
| `--font-h3`        | 18px / 26px           | 500  | -0.005em       | Subseções                                          |
| `--font-body`      | 15px / 24px           | 400  | 0              | Corpo de mensagem, parágrafos                      |
| `--font-body-em`   | 15px / 24px           | 500  | 0              | Negrito inline                                     |
| `--font-body-sm`   | 14px / 22px           | 400  | 0              | Inputs, descriptions                               |
| `--font-caption`   | 12px / 18px           | 400  | 0.02em         | Metadados, datas                                   |
| `--font-eyebrow`   | 11px / 14px           | 500  | 0.12em         | Labels em CAPS (ex: "SUGESTÕES PRA COMEÇAR")       |

### Boas práticas
- Hierarquia por **tamanho** + **peso** + **cor**, não por color decoration.
- Letter-spacing negativo em tudo acima de 18px (visual mais editorial).
- Letter-spacing positivo em CAPS (eyebrows, labels micro).
- Linha de medida ideal: 60-70 caracteres pra leitura.

---

## 4. Spacing (8pt grid)

Tudo em múltiplos de 4px / 8px. Sem números aleatórios.

| Token         | Valor | Quando usar                                |
| ------------- | ----- | ------------------------------------------ |
| `--space-1`   | 4px   | Gaps mínimos, padding fino                 |
| `--space-2`   | 8px   | Padding interno de chips/badges            |
| `--space-3`   | 12px  | Gap entre elementos próximos               |
| `--space-4`   | 16px  | Padding padrão de bolhas, gap entre cards  |
| `--space-5`   | 24px  | Padding de view-inner, espaçamento padrão  |
| `--space-6`   | 32px  | Separação entre seções                     |
| `--space-7`   | 48px  | Margens grandes (admin gate)               |
| `--space-8`   | 64px  | Hero spacing                               |

---

## 5. Radii & Shapes

Forma neutra e estrutural. Sem cantos excessivamente arredondados (não é app casual).

| Token            | Valor   | Uso                                  |
| ---------------- | ------- | ------------------------------------ |
| `--radius-sm`    | 6px     | Inputs, buttons pequenos             |
| `--radius-md`    | 10px    | Buttons principais, cards            |
| `--radius-lg`    | 14px    | Bolhas de chat, cards do admin       |
| `--radius-xl`    | 20px    | Input bar, modais                    |
| `--radius-pill`  | 999px   | Tabs, badges, chips                  |
| `--radius-circle`| 50%     | Avatar                               |

---

## 6. Elevations (Shadows)

Sombras ultra-discretas — editorial não usa sombra pesada.

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
--shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
--shadow-md: 0 8px 24px rgba(0,0,0,0.08);
--shadow-lg: 0 20px 48px rgba(0,0,0,0.12);
```

Usar shadow-xs em cards no estado de repouso, shadow-sm no hover. Reservar shadow-md+ pra modais e elementos flutuantes.

---

## 7. Motion

Snap. Sophisticated. Sem bounce.

```css
--ease-out:    cubic-bezier(0.2, 0.8, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--dur-fast:    140ms;
--dur-base:    220ms;
--dur-slow:    350ms;
```

**Padrões:**
- Hover de botão: `var(--dur-fast) var(--ease-out)`
- Entrada de mensagem: `var(--dur-base) var(--ease-out)` (fade + 6px slide-up)
- Toast: `var(--dur-base) var(--ease-out)`
- Switch de view: instantâneo (sem transição entre chat/admin)

Respeitar sempre `prefers-reduced-motion: reduce`.

---

## 8. Componentes

### Bolha — Zi (assistente)
- `background: var(--color-bg-surface)`
- `border: 1px solid var(--color-border-subtle)`
- `border-radius: 4px var(--radius-lg) var(--radius-lg) var(--radius-lg)`
- `padding: 14px 18px`
- `box-shadow: var(--shadow-xs)`
- Type: `--font-body`, cor `--color-text-primary`

### Bolha — Usuário
- `background: var(--color-brand-accent)` (navy)
- `color: #FFFFFF`
- `border-radius: var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)`
- Sem border, sem shadow (mais sólida visualmente)

### Botão Primário
- `background: var(--color-brand-primary)` (preto)
- `color: #FFFFFF`
- `padding: 11px 20px`
- `border-radius: var(--radius-md)`
- Hover: `background: #000000` (full black)
- Active: `transform: scale(0.97)`

### Botão Secundário / Ghost
- `background: transparent`
- `border: 1px solid var(--color-border-subtle)`
- `color: var(--color-text-primary)`
- Hover: `background: var(--color-bg-surface)`, `border-color: var(--color-border-strong)`

### Input / Textarea
- `background: var(--color-bg-main)`
- `border: 1px solid var(--color-border-subtle)`
- `border-radius: var(--radius-sm)`
- Focus: `border-color: var(--color-brand-accent)`, `box-shadow: 0 0 0 3px var(--color-accent-soft)`

### Chip / Sugestão
- `background: var(--color-bg-main)`
- `border: 1px solid var(--color-border-subtle)`
- `border-radius: var(--radius-pill)`
- Hover: `border-color: var(--color-brand-primary)`, `background: var(--color-bg-surface)`

### Tab
- Base: pill em superfície surface
- Active: `background: var(--color-brand-primary)` (preto), texto branco
- Sem azul nas tabs (reservar azul pra contextos do conteúdo, não navegação)

---

## 9. Avatar (Zi)

A Zi é uma **assistente real** (Zilaide). O avatar é uma **fotografia profissional**, não ilustração.

### Especificações

| Propriedade        | Valor                                        |
| ------------------ | -------------------------------------------- |
| Arquivo            | `assets/zi-avatar.jpg`                       |
| Formato            | JPG ou WebP (otimizada, max 200KB)           |
| Aspect ratio       | 1:1 (quadrada antes do crop)                 |
| Dimensão mínima    | 512×512px (renderiza nítido em retina @64px) |
| Crop              | `border-radius: 50%` + `object-fit: cover`   |
| Posicionamento     | `object-position: 50% 22%` (face centralizada após crop) |
| Estilo da foto     | Fundo neutro/branco, sorriso natural, iluminação suave |
| Roupa visível      | Jaqueta verde-oliva (paleta NV consistente)  |
| Tamanho no header  | 52×52px com ring (`box-shadow` ring de 2px) |
| Tamanho no chat    | 30×30px sem ring                             |

### Quando substituir
- Se mudar a pessoa: trocar `assets/zi-avatar.jpg`, manter mesmo crop/proporção.
- Foto editorial idealmente: ombros enquadrados, olhar pra câmera, sorriso aberto, fundo claro/neutro.

### Acessibilidade
- `<img alt="Zi">` sempre (mesmo decorativo, ajuda a manter consistência).
- Em listas de mensagens (chat), o avatar pode ser `aria-hidden="true"` pra não duplicar nome da Zi.

---

## 10. Layout

### Container
- Max-width: `860px` (`--max-w`)
- Padding lateral: 24px desktop, 16px mobile
- Header sticky com `backdrop-filter: blur(14px)` em superfície semi-translúcida

### Breakpoints
- **Mobile:** ≤ 560px → padding reduzido, type um pouco menor, tabs full-width
- **Tablet+:** ≥ 561px → layout padrão acima

---

## 11. Acessibilidade

- Contraste **AA mínimo** em corpo, **AAA preferível** em texto pequeno
- `:focus-visible` com outline navy 2px sempre visível (nunca remover)
- Touch targets ≥ 44px (botões mobile, tabs, fb buttons)
- Movimento respeita `prefers-reduced-motion`
- `aria-live="polite"` no container de mensagens (já implementado)
- `aria-pressed` em botões toggle (👍/👎 já implementado)

---

## 12. Tom de voz da Zi (não-visual, mas faz parte da identidade)

- **Próximo, descontraído**, como uma colega de RH simpática
- **Direto ao ponto** — respostas curtas, conclusivas
- "Você", não "vocês"; "tô", "pra" são OK no contexto
- 1 emoji por mensagem **no máximo**, e só quando combina
- Quando não souber: token `[NAO_ENCONTREI]` → escala pro RH
- Quando souber: responde confiante, sem "talvez", "acho que"

(Detalhes técnicos do prompt: ver `netlify/edge-functions/zi.js` → `buildSystemPrompt`)

---

## 13. Don'ts

- ❌ Sombras chamativas, brilhos, glow effects
- ❌ Gradientes vibrantes (só os ultra-sutis em backgrounds, se houver)
- ❌ Emoji nos títulos / headings
- ❌ Animações de bounce, spring playful
- ❌ Cor fora dos tokens
- ❌ Italics decorativos (Zi não vai mais em itálico no header)
- ❌ Avatar ilustrado / cartoon — usar a foto

---

## 14. Referências

- NV (Nati Vozza): <https://www.bynv.com.br/>
- Inter (Google Fonts): <https://fonts.google.com/specimen/Inter>
- WCAG 2.1 contraste: <https://webaim.org/resources/contrastchecker/>
- Inspiração editorial: Aritzia, COS, The Row, Toteme
