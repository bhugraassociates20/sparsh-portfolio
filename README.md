# Sparsh Mehta — Portfolio

Personal portfolio for **Sparsh Mehta**, Senior Data Scientist working in GenAI,
agentic AI and healthcare AI.

**Live:** https://sipsmehta.github.io/sparsh-portfolio/ · **Resume:** [`resume.html`](resume.html)

---

## What this is

A static, dependency-free portfolio built around case studies rather than a project
list. Each featured system is presented as **Problem → What I built → Outcome**, followed
by a hand-authored SVG architecture diagram and a measured impact readout.

| Section | Contents |
|---|---|
| Hero | Positioning, current role, and a "Now / Before that / Mentoring / Foundation" story card |
| Impact | Four headline metrics (interactions analysed, publications, patents, competition rank) |
| Selected work | Five case studies, each with an architecture diagram |
| More work | Nine further projects in a compact grid |
| Experience | Timeline, with earlier roles behind a collapsible fold |
| Research | Four peer-reviewed publications (IEEE, Wiley, Taylor & Francis, O'Reilly) |
| Patents | Five filings — one featured, four compact |
| Recognition | Eight competition placements and awards |
| Tech stack | GenAI & agentic, automation & no-code, ML, engineering, analytics |
| Contact | Direct details plus an EmailJS-backed form |

## Stack

Plain **HTML + CSS + vanilla JS**. No build step, no framework, no bundler — open
`index.html` and it runs.

| Concern | Approach |
|---|---|
| Layout | CSS Grid / Flexbox, `clamp()` type scale, custom-property design tokens |
| Responsive | Fluid `1fr` cells throughout; bordered card blocks step between column counts that divide their item counts, borderless text grids use `auto-fit` |
| Theming | One token set re-mapped by `.band--dark` for the dark hero and contact bands |
| Type | Inter + JetBrains Mono (Google Fonts) |
| Icons | Font Awesome 6 (CDN) |
| Diagrams | Inline SVG, authored by hand, theme-aware and horizontally scrollable |
| Motion | Drifting hero grid, accent bloom, headline sheen, live pulses, IntersectionObserver reveals, staggered children, count-up metrics, flowing diagram connectors |
| Animation runtime | `lottie-web` (CDN) reading **inlined** data from `lottie-data.js`, lazy-mounted per element |
| Contact form | EmailJS |

### Files

```
index.html       single-page portfolio
resume.html      standalone printable resume
styles.css       design system + all components
script.js        nav, reveals, count-up, Lottie, contact form
lottie-data.js   generated - inlined Lottie animation data
assets/*.json    the same animations as standalone Lottie files
```

### Why the Lottie data is inlined

`lottie-web` normally fetches an animation by URL. Opening `index.html`
straight from disk makes that a cross-origin request from `null`, which every
browser blocks:

> Access to XMLHttpRequest at `file:///.../hero-network.json` from origin
> `null` has been blocked by CORS policy

So the animations are also emitted into `lottie-data.js` as
`window.LOTTIE_ANIMS`, and `data-lottie` names a key in that object rather than
a path. Nothing is fetched, and the page animates identically whether it is
double-clicked or served. The `.json` files in `assets/` are kept as the
editable source; `script.js` still falls back to fetching a path if
`data-lottie` ends in `.json`.

## Running locally

No tooling required:

```bash
# either open the file directly…
open index.html

# …or serve it (recommended, so the CDN + font requests behave normally)
python -m http.server 8000
# then visit http://localhost:8000
```

## Accessibility & performance notes

- **`prefers-reduced-motion`** is honoured throughout: reveals, count-ups, the
  diagram dash-flow, and every Lottie are disabled, and content renders in its
  final state.
- **JS is enhancement-only.** With scripting off you still get the full page —
  metrics show their final values (they are in the HTML, not injected), and
  reveal-animated sections fall back to visible.
- **Lottie animations are lazy-mounted** via IntersectionObserver and skipped
  entirely under reduced motion, so they cost nothing on first paint.
- Diagrams carry descriptive `role="img"` + `aria-label` text, and wide content
  scrolls inside its own container so the page never scrolls sideways.
- A print stylesheet strips the nav, form, and all decoration.

## Responsive behaviour

Two different strategies, on purpose.

**Borderless text grids** (`.case__narrative`, `.skills-layout`) use
`repeat(auto-fit, minmax(...))` and reflow continuously. A short last row is
invisible without a frame around it.

**Bordered card blocks** (`.stats`, `.awards`, `.mini-grid`, `.pat-list`,
`.impact`) hold a fixed number of items, so they step between column counts
that *divide* those counts — otherwise the leftover cells sit enclosed inside
the border as visible gaps (8 awards across 5 columns leaves two blanks in a
bordered box). Cells still stretch with `1fr` between the steps, so resizing
feels continuous.

| Grid | Items | Column steps |
|---|---|---|
| `.stats` | 4 | 4 → 2 (≤820) → 1 (≤470) |
| `.awards` | 8 | 4 → 2 (≤820) → 1 (≤470) |
| `.mini-grid` | 9 | 3 → 1 (≤760) |
| `.pat-list` | 4 | 2 → 4 (≤940, once patents stack) → 2 (≤760) → 1 (≤470) |
| `.impact` | 3 | 3 → 1 (≤560) |

Hairlines are drawn **per cell** (`box-shadow` top + left, outermost pair
clipped by the container) rather than by a `1px` gap over a line-coloured
background. With the gap technique any empty cell renders as a solid block of
line colour; per-cell hairlines mean an empty cell renders as nothing, so
adding or removing an item degrades gracefully instead of producing a grey
slab.

**If you add or remove items in one of those grids, revisit its column steps.**

## Editing guide

Common changes and where they live:

- **Add a case study** — copy an `<article class="case">` block in `index.html`,
  bump the `case__idx`, and give its `<svg>` a **unique `<marker>` id** (`ar0`…`ar4`
  are taken); marker ids must not collide across diagrams.
- **Change a metric** — edit both the visible text and the `data-count` attribute
  (`data-dec="1"` for one decimal place) so the no-JS fallback stays correct.
- **Swap a Lottie** — `data-lottie` names a key in `window.LOTTIE_ANIMS`
  (`hero-network`, `mark-pulse`). To use a different animation, add it to
  `lottie-data.js`; a value ending in `.json` is fetched instead, which only
  works over http(s), not `file://`. The two bundled animations are generated,
  and the hero is baked in the dark-band accent while the section marks use the
  light-band accent.
- **Recolour** — every colour is a custom property in `:root` and `.band--dark`
  at the top of `styles.css`; `--accent` is the single accent hue.
- **EmailJS keys** are the three constants at the bottom of `script.js`.

## Contact

**sipsmehta@gmail.com** · [LinkedIn](https://linkedin.com/in/sparsh-mehta) · [GitHub](https://github.com/sipsmehta)
