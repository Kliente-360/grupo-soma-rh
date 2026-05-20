# UI/UX Style Guide — Grupo Soma Inspired Chatbot (Zi)

Sistema de design da Zi alinhado com o ecossistema Grupo Soma — equilibrando **tech corporativa**, solidez operacional e um toque **criativo/orgânico** vindo das marcas (Animale, Farm, Foxton, NV…).

**Audiência:** quem for mexer no `index.html`, criar variações da Zi em outros canais, ou auditar consistência visual.

---

## 1. Princípios de Design

### Corporate + Organic
A Zi vive em ambiente corporativo (RH), mas a marca-mãe vende moda e estilo. Visual precisa ser **profissional sem ser estéril**: cantos suaves, paleta neutra com **um acento quente** (terracota), fontes humanistas.

### Soft Minimalism
Hierarquia limpa por tamanho/peso, não por decoração. Sombras quase imperceptíveis. Sem gradientes vibrantes, sem glow, sem playful bounce.

### Multi-brand awareness
Tags/badges de marca (Animale, Farm, etc.) devem caber no sistema sem ruído visual — uppercase pequeno + cinza neutro.

---

## 2. Color Tokens (Soma Palette)

CSS variables em `:root` do `index.html`. Tokens internos mantêm o prefixo `--nv-*` por compatibilidade com o resto do código.

| Token (guide)         | CSS var (no código)   | Hex       | Uso                                                              |
| --------------------- | --------------------- | --------- | ---------------------------------------------------------------- |
| `color-soma-dark`     | `--nv-coffee`         | `#1C1B1B` | Texto principal, títulos, fundo da bolha do usuário              |
| `color-soma-accent`   | `--nv-clay`           | `#D98A6C` | Terracota — acentos, ícones ativos, hover de chips, brand touch  |
| `color-soma-accent-soft` | `--nv-clay-light`  | `#F7E5DC` | Tint da terracota — bg hover, focus ring                         |
| `color-soma-bg`       | `--nv-paper`          | `#FFFFFF` | Background principal da aplicação                                |
| `color-soma-surface`  | `--nv-cream`          | `#F8F9FA` | Bolhas da Zi, cards, panels                                      |
| `color-soma-elevated` | `--nv-cream-deep`     | `#FCFCFD` | Surface secundária (empty state, gate)                           |
| `color-soma-border`   | `--nv-line`           | `#E9ECEF` | Linhas, bordas inativas, divisores                               |
| `color-soma-border-strong` | `--nv-line-strong`| `#CED4DA` | Borders hover, separadores enfatizados                           |
| `color-soma-muted`    | `--nv-coffee-mute`    | `#6C757D` | Texto secundário, timestamps, placeholders                       |
| `color-soma-soft`     | `--nv-coffee-soft`    | `#495057` | Texto de hint, labels                                            |
| `color-soma-success`  | `--nv-success`        | `#2D8456` | Feedback 👍, sucesso                                              |
| `color-soma-danger`   | `--nv-danger`         | `#C44536` | Feedback 👎, erros                                                |

**Regras:**
- Terracota é **o** acento — único ponto de cor além do preto/cinza/branco.
- Antes navy era o acento (versão "Editorial Luxury"); foi substituído por terracota pra alinhar com a identidade do ecossistema Soma.
- Contraste WCAG AA mínimo em texto sobre superfícies.

---

## 3. Tipografia

Abordagem **tech-humanist sans-serif** — premium e moderna sem ser fria.

- **Primária:** `Plus Jakarta Sans` (Google Fonts)
- **Secundária:** `Satoshi` (Fontshare) — fallback editorial
- **Sistema:** `-apple-system`, `BlinkMacSystemFont`, `system-ui`

### Escala

| Token              | Tamanho / Line-height | Peso | Case             | Uso                                              |
| ------------------ | --------------------- | ---- | ---------------- | ------------------------------------------------ |
| `--font-header`    | 16px / 24px           | 700  | Sentence case    | Título do app, seções principais                 |
| `--font-section`   | 20px / 28px           | 700  | Sentence case    | H2 do admin (mais espaço pra hierarquia)         |
| `--font-body`      | 15px / 1.6 (24px)     | 400  | —                | Corpo de mensagem, parágrafos                    |
| `--font-body-em`   | 15px / 1.6            | 600  | —                | Inline emphasis (`**negrito**`)                  |
| `--font-button`    | 13px / 18px           | 600  | Sentence case    | Botões, tabs, send                               |
| `--font-caption`   | 11px / 14px           | 500  | Sentence case    | Timestamps, labels, hints, metadados             |
| `--font-eyebrow`   | 10px / 14px           | 600  | UPPERCASE +0.12em | Brand badges ("ANIMALE", "FARM"), eyebrow labels |

### Letter-spacing
- Headings (≥16px, 700): `-0.01em` (densidade tech)
- Body: `0`
- Eyebrows / labels CAPS: `+0.12em`

---

## 4. Spacing (8pt grid)

| Token         | Valor | Uso                                          |
| ------------- | ----- | -------------------------------------------- |
| `--space-1`   | 4px   | Gaps mínimos                                 |
| `--space-2`   | 8px   | Padding de chips, gap entre ícones           |
| `--space-3`   | 12px  | **Margin bottom de bolhas** (ver §5.1)       |
| `--space-4`   | 16px  | Padding interno de bolhas, gap entre cards   |
| `--space-5`   | 24px  | Padding de view-inner                        |
| `--space-6`   | 32px  | Separação entre seções                       |
| `--space-7`   | 48px  | Hero, gate                                   |

---

## 5. Componentes & Padrões

### 5.1 Bolhas (fluidas, acolhedoras)

**Zi (assistant):**
- `background: var(--nv-cream)` (surface F8F9FA)
- `color: var(--nv-coffee)` (dark)
- `border-radius: 16px 16px 16px 4px` (TL TR BR BL — corner pequena bottom-left)
- `padding: 14px 18px`
- `margin-bottom: 12px` (respiro)

**Usuário:**
- `background: var(--nv-coffee)` (dark)
- `color: white`
- `border-radius: 16px 16px 4px 16px` (corner pequena bottom-right)
- `padding: 14px 18px`

### 5.2 Input bar (floating pill)

- `border-radius: 24px` (pill)
- `border: 1px solid var(--nv-line)`
- `background: var(--nv-paper)`
- `box-shadow: var(--shadow-sm)` (sutilíssimo)
- Posição sticky/floating perto do bottom

### 5.3 Quick Replies / Sugestões

**Pill outlined:**
- `border-radius: 100px` (full pill)
- `border: 1px solid var(--nv-coffee)` (preto, contrastado)
- `padding: 8px 16px`
- `background: transparent`
- `font: var(--font-button)` (13px / 600)
- Hover: `background: var(--nv-clay-light)` (tint terracota suave)
- Active: `background: var(--nv-clay)` (terracota cheia), `color: white`

### 5.4 Botões

**Primário (CTA):**
- `background: var(--nv-coffee)`
- `color: white`
- `border-radius: 100px` (full pill)
- `padding: 11px 22px`
- `font: var(--font-button)`
- Hover: `background: #000000`

**Secundário / Ghost:**
- `background: transparent`
- `border: 1px solid var(--nv-line)`
- `color: var(--nv-coffee)`
- Hover: `border-color: var(--nv-coffee)`, `background: var(--nv-cream)`

### 5.5 Tabs

- Container pill em surface
- Active: `background: var(--nv-coffee)`, `color: white`
- Inactive: `color: var(--nv-coffee-soft)`
- Badge: terracota (`var(--nv-clay)`) com texto branco

### 5.6 Brand/Product Cards (futuro)

Quando tiver carrossel multi-marca:
- `border-radius: 8px` nas imagens (subtle curve)
- Brand badge acima do título: `--font-eyebrow`, uppercase, cor `--nv-coffee-mute`
- Cards em `var(--nv-cream)`, border `1px solid var(--nv-line)`

---

## 6. Radii

| Token            | Valor   | Uso                                              |
| ---------------- | ------- | ------------------------------------------------ |
| `--radius-xs`    | 4px     | Bordas pequenas (corner da bolha)                |
| `--radius-sm`    | 8px     | Imagens, badges                                  |
| `--radius-md`    | 12px    | Cards do admin, modais                           |
| `--radius-lg`    | 16px    | Bolhas de chat                                   |
| `--radius-xl`    | 24px    | Input bar                                        |
| `--radius-pill`  | 100px   | Botões, chips, tabs, badges                      |
| `--radius-circle`| 50%     | Avatar                                           |

---

## 7. Shadows (sutis)

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
--shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
--shadow-md: 0 8px 24px rgba(0,0,0,0.08);
--shadow-lg: 0 20px 48px rgba(0,0,0,0.12);
```

Padrão: input bar usa `--shadow-sm`, cards em repouso usam `--shadow-xs`, modais usam `--shadow-md`.

---

## 8. Motion

```css
--ease-out:    cubic-bezier(0.2, 0.8, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.4, 0.5, 1);
--dur-fast:    140ms;
--dur-base:    220ms;
--dur-slow:    350ms;
```

- Hover/foco: `var(--dur-fast) var(--ease-out)`
- Entrada de mensagem: `var(--dur-base) var(--ease-out)` (fade + 6px slide-up)
- Toast: `var(--dur-base) var(--ease-spring)` (entrada com squash leve)
- Respeitar sempre `prefers-reduced-motion: reduce`

---

## 9. Avatar (Zi)

A Zi é uma **assistente real**. Avatar é **fotografia profissional**, não ilustração.

| Propriedade        | Valor                                        |
| ------------------ | -------------------------------------------- |
| Arquivo            | `assets/zi-avatar.jpg`                       |
| Formato            | JPG/WebP otimizada, max 200KB                |
| Aspect ratio       | 1:1                                          |
| Dimensão mínima    | 512×512px                                    |
| Crop               | `border-radius: 50%` + `object-fit: cover`   |
| Posicionamento     | `object-position: 50% 22%`                   |
| Estilo da foto     | Fundo neutro/branco, sorriso natural         |
| Tamanho header     | 52×52px com ring (`box-shadow` 2px)          |
| Tamanho chat       | 30×30px sem ring                             |

### Substituir a foto
Trocar `assets/zi-avatar.jpg` mantendo crop/proporção. Foto ideal: ombros enquadrados, olhar pra câmera, sorriso aberto, fundo claro.

---

## 10. Layout

- Container max-width: `860px`
- Padding lateral: 24px desktop, 16px mobile
- Header sticky com `backdrop-filter: blur(14px)` sobre superfície semi-translúcida
- Breakpoint mobile: ≤ 560px (padding reduzido, tabs full-width)

---

## 11. Acessibilidade

- Contraste **AA mínimo** em corpo; **AAA preferível** em texto micro
- `:focus-visible` com outline terracota 2px (não removido)
- Touch targets ≥ 44px (mobile)
- `prefers-reduced-motion` respeitado
- `aria-live="polite"` no container de mensagens
- `aria-pressed` em toggles (👍/👎)

---

## 12. Tom de voz da Zi

- **Próximo, descontraído** — uma colega de RH simpática
- **Direto ao ponto** — respostas curtas, conclusivas
- "Você", não "vocês"; "tô", "pra" são OK
- 1 emoji por mensagem **no máximo**
- Não souber: token `[NAO_ENCONTREI]` → escala pro RH
- Quando souber: confiante, sem "talvez", "acho que"

(Detalhes do prompt: `netlify/edge-functions/zi.js` → `buildSystemPrompt`)

---

## 13. Don'ts

- ❌ Cor fora dos tokens
- ❌ Mais de um acento de cor (só terracota além do preto/cinza)
- ❌ Sombras chamativas, glow, brilho artificial
- ❌ Gradientes vibrantes
- ❌ Emoji nos títulos
- ❌ Animações bouncy/playful
- ❌ Italics decorativos em headings
- ❌ Avatar ilustrado / cartoon — sempre a foto

---

## 14. Referências

- Grupo Soma: <https://grupoazzas.com.br/> (AZZAS 2154 — holding)
- Marcas-âncora: Animale, Farm, Foxton, NV, Cris Barros, Maria Filó
- Plus Jakarta Sans: <https://fonts.google.com/specimen/Plus+Jakarta+Sans>
- Satoshi (Fontshare): <https://www.fontshare.com/fonts/satoshi>
- WCAG 2.1 contraste: <https://webaim.org/resources/contrastchecker/>
