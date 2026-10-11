# Claude Code prompt — Zerpy "Under construction" landing page

Paste everything below the line into Claude Code, run from the root of the new (or existing) React project, with this handoff folder copied into the repo as `design_handoff_zerpy_landing/`.

---

Build the Zerpy landing page: an animated "Under construction" hero, followed by a section of link cards to my other projects. Use React + TypeScript, the same way my other Zerpy projects are set up (Vite, function components, `.tsx`, inline styles or CSS modules driven by `--zp-*` CSS custom properties). If this repo already has a framework, router, or a Zerpy design system package, use it and don't add a second one.

## Reference material in `design_handoff_zerpy_landing/`

- `reference/Under Construction Hero.dc.html` + `reference/construction-hero.jsx` — the working HTML prototype. **It's a design reference, not production code.** It runs on a fixed 1600×900 video-timeline engine (`useComposition`, `CompositionStage`, `TweaksPanel`) that must NOT be ported. Read `construction-hero.jsx` for exact card markup, colors, sizes, easing and timing math, then reimplement it as a normal responsive React component with its own requestAnimationFrame clock.
- `zerpy-tokens/*.css` — the Zerpy design tokens (`colors.css`, `fonts.css`, `spacing.css`, `typography.css`, `depth.css`, `scale.css`). Import them once globally (e.g. `src/styles/zerpy/` imported from `main.tsx`). Style everything against `var(--zp-*)`; don't hardcode hex values that already have a token.
- `zerpy-components/Panel.tsx`, `zerpy-components/SectionHeading.tsx` — Zerpy components used by the projects section. Copy them into `src/components/zerpy/` unchanged (or use the repo's existing copies if there are any).

Before writing code, look over the repo structure, entry point, global styles and any existing components, and integrate into them. Don't restructure unrelated code.

## Page structure

```
<main>  background: var(--zp-ground); min-height: 100vh; starfield overlay
  <ConstructionHero />        — full viewport height (min-height: 100svh), content centered
  <ProjectsSection />         — below the hero
</main>
```

The ground: apply `background: var(--zp-ground)` to the page root, plus an absolutely positioned overlay `background-image: var(--zp-starfield); opacity: var(--zp-starfield-opacity) /* .3 */; pointer-events: none; inset: 0`. Body background `var(--zp-bg)` (`#08080f`) so overscroll matches.

Fonts: Instrument Sans (UI) and Roboto Mono (micro-labels) via `zerpy-tokens/fonts.css` (Google Fonts import).

## 1. ConstructionHero

### Layout (desktop, ≥ 1100px)
Vertical flex column, centered, `gap` based:
1. **Headline** `UNDER CONSTRUCTION` — Instrument Sans 500, 46px desktop (clamp(28px, 4vw, 46px)), letter-spacing `.16em`, line-height 1.1, color `var(--zp-text)` (#f2f1fb). Add `padding-left: .16em` so the tracking doesn't push it off-center. Rendered as `<h1>`.
2. **Message** `We’re building something great. Check back soon!` — 22px desktop (clamp(16px, 1.6vw, 22px)), line-height 1.4, color `var(--zp-text-3)`. 20px gap below the headline.
3. **Card row** (the animation) — ~120px below the message.
4. **Progress indicator** — ~90px below the card row's center line.

Headline and message text come from props (`headline`, `message`) with the above defaults. They never animate.

### Card row geometry
- **4 positions** in one horizontal row. Desktop card size **184 × 112px**, position pitch (center to center) **250px**, so the gap between cards is 66px. Row width = 3 × 250 + 184 = 934px, centered.
- **Chevrons** between adjacent positions (3 total), centered in each 66px gap: 14×14px SVG, path `M9 5l7 7-7 7`, stroke-width 2, round caps/joins, color `rgba(196,187,255,.78)` at stroke-opacity .35 at rest.
- The row container is `position: relative`, `overflow: visible`, and all cards are absolutely positioned and moved with `transform: translateX(...)` only. Never animate `left`/`width`.

### Responsive
- **Tablet (640–1099px)**: scale the whole row with a CSS variable: card 156×95, pitch 212. Keep 4 positions.
- **Mobile (< 640px)**: **3 positions**, card 136×84, pitch 160 (rows narrower than 3×pitch must still fit 320px viewports, so drop the pitch further if needed). Reduce inner card padding to 10px/12px and hide the thinnest third text line in each card if it gets cramped. Icons must stay ≥ 14px.
- Use one implementation with the position count and dimensions as derived values (from a `useMediaQuery`/ResizeObserver hook), not separate components.
- The hero must never cause horizontal page overflow: put `overflow-x: clip` on the hero section.

### Placeholders (one per position, always rendered under the cards)
- Same box as a card, `border: 1px dashed var(--zp-line-strong)` (use `rgba(150,145,200,.28)`), radius `var(--zp-radius)` (4px), transparent fill.
- Positions 0–2 show a 16px plus icon (`M12 6v12M6 12h12`, stroke `rgba(196,187,255,.78)`, width 1.6) at 55% opacity.
- The **rightmost** position shows a 26px loading ring instead: a full circle r=10 stroked `var(--zp-line)` 1.6px, plus a quarter arc `M13 3 A10 10 0 0 1 23 13` stroked `var(--zp-accent-400)` (#a99cf0) at .8 opacity, round cap, rotating continuously (~1.1s per turn).
- **Placeholder opacity is derived from the cards**: for each position, `cover = max over cards of card.opacity × max(0, 1 − |card.x − position.x| / (pitch × 0.55))`, then `placeholderOpacity = 1 − 0.94 × cover`. So the dashed box fades out as a card slides over it and reappears as it leaves, with no separate timers.

### UI cards
Six types, rendered as real HTML + inline SVG (see `CardBody` in `construction-hero.jsx` for exact markup and every width/height):

| type | contents |
| --- | --- |
| `code` | `</>` icon + 58px title line; three mono-ish rows: (22px accent line + 70px line), indented 14px (40px accent line + 46px faint line), 30px faint line |
| `image` | 44px-tall preview well (`rgba(145,132,217,.10)` fill, 1px `var(--zp-line)` border, 2px radius) with the landscape icon centered; 92px and 64px lines below |
| `stats` (chart) | three bars 11px wide, heights 30/54/40px, the middle bar `rgba(169,156,240,.55)`, the others `.26`; right column: bars icon, 58px line, 42px line |
| `text` | four lines: 84px (7px tall, strongest), 146px, 128px, 96px (faint) |
| `settings` | gear icon + 60px title line; two rows with a label line (74px / 54px) and a 22×12 toggle (first on: accent-tint fill, knob right in `#c4bbff`; second off) |
| `user` | 34px circular avatar outline (head + shoulders drawn with bordered circles, 1.5px `rgba(196,187,255,.78)`), name 70px + meta 48px lines, then a 140px faint line |

Card shell:
- `padding: 14px 16px`, `box-sizing: border-box`, radius 4px.
- Background `linear-gradient(180deg, rgba(30,29,52,.96), rgba(18,18,34,.96))`. It's deliberately near-opaque (unlike a normal Zerpy panel) so cards read clearly over placeholders and chevrons. No backdrop blur.
- Border 1px `rgba(150,145,200,.28)`.
- Shadow at rest `0 10px 28px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)`. While moving, interpolate with `moving` (0–1) to `0 18px 42px rgba(0,0,0,.47)` and lift `translateY(-2px × moving)`.
- Placeholder line colors: strong `rgba(214,211,238,.48)`, mid `rgba(190,186,220,.26)`, faint `rgba(170,166,210,.15)`. Lines are 6px tall, 2px radius.
- Icons: 18px, 24-unit viewBox, stroke `rgba(196,187,255,.78)`, width 1.6, round caps/joins, `fill="none"`, `aria-hidden`. Use the inline SVG paths from `ICONS` in `construction-hero.jsx` (Lucide-style). No icon library dependency.

Card order cycles through `TYPES = ['code','image','stats','text','settings','user']`. Card `id` is a monotonically increasing integer; `type = TYPES[id % 6]`. Use `id` as the React key so cards never remount while moving.

### The animation: a horizontal assembly line
Direction is always the same: **new cards enter from the right, the row shifts left, the leftmost card leaves to the left.**

Each step lasts ~1.7–2.0s. Within a step, with `u` = seconds since the step started (positions indexed 0..N−1, N = 4 desktop/tablet, 3 mobile; `X(i)` = center x of position i):

| time in step | what happens |
| --- | --- |
| 0 → 0.38s | **Exit.** The card at position 0 moves to `X(0) − 0.4 × pitch`, opacity `1 − p^1.5`, scale `1 − 0.08 × e`. Its border flashes to `rgba(220,214,255,.95)` at u=0 and fades back over 0.14s. |
| 0.14 → 0.84s | **Poof.** 8–12 particles burst from around `X(0) − 0.3 × pitch` (spread ±0.3 card width, ±0.3 card height), flying left/up-left (angle π ± 0.65π), 26–76px, drifting up 14px extra, opacity `(1−t)^1.4 × (.55–.9)`. Shapes: 2–4px squares, 45° diamonds, or 1.5×7px streaks; color `rgba(214,208,255,.9)`. |
| 0.12 → 0.72s | **Shift.** Every remaining card (positions 1..N−1) translates one pitch left, all together, same easing. `moving = sin(π × shiftProgress)` for the shadow/lift. |
| (during shift) | The rightmost dashed placeholder and its loading ring are revealed. |
| 0.66 → 1.16s | **Enter.** The new card slides from `X(N−1) + 50px` to `X(N−1)`, opacity eases in over the first 60% of the move, scale 0.97 → 1. |
| 1.02 → 1.42s | **Lock-in glow.** Border goes to `rgba(169,156,240, .3 + .25 × active + .25 × glow)`, plus `0 0 (24 × glow)px rgba(145,132,217, .45 × glow)` added to the shadow. `glow = sin(π × min(1, g × 2.2)) × (1−g)^0.6` for g in 0..1. While the card is arriving (u < 1.02), `active = 1` so it already carries a faint accent border; it fades to 0 with the glow. 3–5 tiny 2px sparks rise 14–36px off the card's top edge and fade over 0.7s. |
| 1.42s → end | Hold. Everything is still. |

**Chevron highlight**: the chevron directly before the incoming card brightens (stroke `#c4bbff`, opacity up to .95) on a `sin` pulse from u = 0.51 to 1.27s. The first chevron pulses during the exit (0 → 0.45s), and the middle ones pulse at half strength during the shift.

**Easing**: Zerpy has one curve, `cubic-bezier(.2,.7,.3,1)`, for every move (enter, shift, exit). Implement a tiny cubic-bezier solver (see `bez()` in the reference). Particles and glows use `easeOutCubic` (`1 − (1−p)^3`). Exit fades use `p^2` / `p^1.5`. Don't add a bounce or overshoot anywhere.

**Step lengths**, which vary a little so the loop doesn't feel mechanical: `[1.7, 1.9, 1.8, 1.7, 2.0, 1.8]` seconds (one cycle = six steps = 10.9s, after which the card types repeat). The loop is seamless by construction: the row is the same shape at the start of every step, only the card types advance.

**Ambient particles**: ~8 tiny 2px dots/diamonds drifting slowly (±16px, ±10px) across the row area, opacity .08–.22, on sine waves. Keep it sparse.

### Animation controller (important)
- **One clock**. A single `useAnimationClock()` hook runs one `requestAnimationFrame` loop and gives you elapsed seconds. Everything visible is a **pure function of time**: `rowState(t) → { stepIndex, u, cards: [{id, type, x, opacity, scale, glow, flash, active, moving}] }`. Placeholders, chevrons, particles and progress are all derived from the same `t`. No per-card timers, no `setTimeout` chains.
- To keep React renders cheap, render the cards, placeholders, chevrons and progress from state updated once per frame, and memoize `CardBody` by `type` (`React.memo`) so only the shell's `transform`/`opacity`/`border`/`box-shadow` change per frame. Alternatively, write the per-frame styles to refs directly, which is also fine. Particles: render at most ~25 nodes, computed deterministically from `(stepIndex, i)` with a seeded hash (see `rnd()`), so nothing accumulates.
- **Pause when off-screen**: an IntersectionObserver on the hero stops the rAF loop when it isn't visible, and `document.visibilitychange` pauses it too. Resume without a jump (store accumulated time and subtract paused duration).
- Clean up the rAF loop and observers on unmount. Guard against double loops in React StrictMode/HMR (the effect cleanup must cancel the frame).
- **`prefers-reduced-motion: reduce`**: don't run the clock. Render a static assembled row (all N positions filled with cards, no particles, no glow, the ring not spinning) and a static progress bar at ~50%.

### Progress indicator
Under the row, centered, gap 16px:
- **Segmented bar**: 288px wide (240px on mobile), 12 segments in a flex row with 3px gap. Each segment 7px tall, radius 1px, `background: rgba(255,255,255,.05)`, border 1px `var(--zp-line)`, `overflow: hidden`. The fill inside is `var(--zp-accent)` (#9184d9) at .85 opacity.
- Fill logic, with no percentage text: the filled amount grows by 1/12 × ~1.44 per step (`b = 0.12 × (stepIndex + shiftEased)` within a 6-step cycle), reaching ~72%. During the last step of the cycle the fill **drains from the left** (the left edge `a` eases from 0 up to `b`) so it's empty when the cycle wraps. Per segment: `lo = clamp(a × 12 − i)`, `hi = clamp(b × 12 − i)`, fill spans `left: lo × 100%`, `width: (hi − lo) × 100%`.
- **Label** below: `BUILDING INTERFACE` + animated dots (0–3 dots cycling ~2.5×/s, in a fixed 30px-wide inline-block so the text doesn't shift). Roboto Mono 15px desktop / 12px mobile, letter-spacing .18em, uppercase, color `var(--zp-text-3)`.

### Accessibility
- The card row, chevrons, placeholders and particles are decorative: wrap them in a container with `aria-hidden="true"`.
- Headline is the page's `<h1>`, message a `<p>`. Status label can be `role="status"` with static text "Building interface" (the dots are aria-hidden).

## 2. ProjectsSection

Directly below the hero.

- `<section>` with padding `72px 24px 96px`, inner column `max-width: 1040px; margin: 0 auto`, flex column, gap 28px.
- Heading: `<SectionHeading eyebrow="Elsewhere" title="Other projects" />` (Zerpy component).
- Grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 12px;`
- Each card is an `<a>` wrapping a Zerpy `<Panel padding="18px">`:
  - Inside: a flex row, `space-between`, `align-items: center`, gap 12px.
  - Left: a column with gap 6px containing
    - an eyebrow, Roboto Mono 11px, letter-spacing .14em, uppercase, `var(--zp-text-4)`;
    - a title, Instrument Sans 17px / 500, `var(--zp-text)`.
  - Right: a `›` glyph, 15px, `var(--zp-accent-400)`.
  - The `<a>`: `display: block; color: inherit; text-decoration: none; border-radius: 4px; transition: transform 180ms, box-shadow 180ms` with `cubic-bezier(.2,.7,.3,1)`.
  - Hover: `translateY(-2px)`, `box-shadow: var(--zp-accent-glow)` (`0 0 16px rgba(145,132,217,.28)`), and the panel border brightens to `var(--zp-line-accent)`.
  - Focus-visible: the border goes to `var(--zp-focus-line)` with `var(--zp-focus-shadow)` (from `depth.css`). No outline ring outside the card.
- Data is an array so it's easy to edit (`src/data/projects.ts`):

```ts
export const projects = [
  { name: 'Video Trimmer',           kind: 'Tool',  href: '#' },
  { name: 'Raid Calendar',           kind: 'Tool',  href: '#' },
  { name: 'ForeverLoot Addon',       kind: 'Addon', href: '#' },
  { name: 'ZerpyUI Addon',           kind: 'Addon', href: '#' },
  { name: 'Saved Variables Manager', kind: 'Tool',  href: '#' },
];
```
Leave `href: '#'` as TODOs. I'll fill in the URLs. External links get `target="_blank" rel="noopener noreferrer"`.

## Suggested files

```
src/
  styles/zerpy/            ← copy of design_handoff_zerpy_landing/zerpy-tokens/*.css
  components/zerpy/Panel.tsx, SectionHeading.tsx
  components/hero/
    ConstructionHero.tsx    layout, headline, message, progress, reduced-motion switch
    AssemblyRow.tsx         positions, placeholders, chevrons, cards, particles
    UICard.tsx              shell + CardBody by type (memoized)
    icons.tsx               inline SVG icons (code, image, stats, settings, plus, ring, chevron)
    useAnimationClock.ts    single rAF clock with pause/resume + IntersectionObserver
    rowState.ts             pure timing math (rowState, progress, particle generation, easing)
    config.ts               TYPES, STEP_DURATIONS, card sizes per breakpoint, timing constants
  components/ProjectsSection.tsx
  data/projects.ts
  App.tsx                   <main> ground + starfield, <ConstructionHero/>, <ProjectsSection/>
```

Keep every tunable in `config.ts`: headline/message defaults, card order, step durations, timing constants (`EXIT=0.38, BURST_AT=0.14, SHIFT_AT=0.12, SHIFT_DUR=0.6, ENTER_AT=0.66, ENTER_DUR=0.5, GLOW_AT=1.02, GLOW_DUR=0.4, BURST_DUR=0.7`), sizes per breakpoint, and particle counts. Write unit tests for `rowState` covering: card ids are stable across a step, the leftmost card is gone after `EXIT`, the new card sits at the last position after `ENTER_AT + ENTER_DUR`, and the progress values at the cycle boundary match (seamless loop).

## Acceptance checklist
1. Cards travel horizontally: enter right, shift left together, exit left with a particle poof.
2. Dashed placeholders show wherever no card covers a position, and never show over a settled card.
3. A brief border glow and sparks mark each arrival. Nothing pulses continuously.
4. The loop runs indefinitely with no visible reset. Card types and progress cycle cleanly.
5. 4 positions on desktop/tablet, 3 on mobile, no horizontal overflow at 320px.
6. Reduced motion shows a static, complete row.
7. The animation pauses when the hero is off-screen or the tab is hidden. No console errors, no leaked rAF loops.
8. The projects grid wraps from 3 columns down to 1, and hover/focus states match the spec.
9. All colors, radii, shadows and fonts come from Zerpy tokens. No new palette.

When done, list the files you added or changed and where to adjust the copy, card order, timing and the project links.
