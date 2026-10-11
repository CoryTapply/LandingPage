// Pure timing math for the assembly line. Everything visible is a function of
// elapsed seconds `t` and the row layout; nothing here touches the DOM.
import {
  AMBIENT_COUNT, BREAKPOINTS, BURST_AT, BURST_DUR, BURST_EXTRA, BURST_MIN, COMPACT_BELOW, COVER_REACH,
  COVER_STRENGTH, DESIGN_CARD_W, DRAIN_AT, ENTER_AT, ENTER_DUR, ENTER_OFFSET, ENTER_SCALE_FROM, EXIT,
  EXIT_SHRINK, EXIT_TRAVEL, FILL_PER_STEP, FLASH_DUR, GLOW_AT, GLOW_DUR, MIN_GAP, SHIFT_AT, SHIFT_DUR,
  SIZES, SPARK_EXTRA, SPARK_MIN, STEP_DURATIONS, TYPES, type CardType,
} from './config';

// ── Easing ──
export function bez(x1: number, y1: number, x2: number, y2: number) {
  const f = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 18; i++) { t = (lo + hi) / 2; if (f(t, x1, x2) < x) lo = t; else hi = t; }
    return f(t, y1, y2);
  };
}
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
// Zerpy's one curve, used for every move.
export const ease = bez(.2, .7, .3, 1);
export const easeOutCubic = (p: number) => 1 - (1 - clamp01(p)) ** 3;
// Deterministic hash in 0..1, so particles need no stored state.
export const rnd = (a: number, b: number, c: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return x - Math.floor(x);
};

// ── Layout ──
export interface RowLayout {
  positions: number;
  cardW: number;
  cardH: number;
  pitch: number;
  rowW: number;
  scale: number; // card contents scale, relative to the desktop design
  compact: boolean;
}

/** Row dimensions for a viewport width, squeezed to fit `available` px if needed. */
export function computeLayout(viewportW: number, available: number): RowLayout {
  const base = viewportW >= BREAKPOINTS.desktop ? SIZES.desktop : viewportW >= BREAKPOINTS.tablet ? SIZES.tablet : SIZES.mobile;
  const n = base.positions;
  let { cardW, cardH, pitch } = base;
  if ((n - 1) * pitch + cardW > available) {
    // Close the gaps first, then shrink the cards.
    pitch = Math.max(cardW + MIN_GAP, (available - cardW) / (n - 1));
    if ((n - 1) * pitch + cardW > available) {
      const w = Math.max(40, (available - (n - 1) * MIN_GAP) / n);
      cardH = (cardH * w) / cardW;
      cardW = w;
      pitch = cardW + MIN_GAP;
    }
  }
  const scale = cardW / DESIGN_CARD_W;
  return { positions: n, cardW, cardH, pitch, rowW: (n - 1) * pitch + cardW, scale, compact: scale < COMPACT_BELOW };
}

/** Center x of position i, relative to the row's center. */
export const positionX = (i: number, layout: RowLayout) => (i - (layout.positions - 1) / 2) * layout.pitch;

// ── Steps ──
export const CYCLE = STEP_DURATIONS.reduce((a, b) => a + b, 0);
const STEPS = STEP_DURATIONS.length;

export interface StepInfo {
  stepIndex: number; // counts up forever
  cycleStep: number; // 0..STEPS-1
  u: number; // seconds since the step started
  stepLength: number;
}

export function stepAt(t: number): StepInfo {
  const time = Math.max(0, t);
  const cycles = Math.floor(time / CYCLE);
  const tc = time - cycles * CYCLE;
  let cycleStep = 0, start = 0;
  for (let i = 0, acc = 0; i < STEPS; i++) {
    if (tc >= acc) { cycleStep = i; start = acc; }
    acc += STEP_DURATIONS[i];
  }
  return { stepIndex: cycles * STEPS + cycleStep, cycleStep, u: tc - start, stepLength: STEP_DURATIONS[cycleStep] };
}

// ── Cards ──
export interface CardState {
  id: number;
  type: CardType;
  x: number; // center, relative to the row's center
  opacity: number;
  scale: number;
  glow: number;
  flash: number;
  active: number;
  moving: number;
}

export interface RowState extends StepInfo {
  shiftEased: number;
  cards: CardState[];
}

const card = (id: number, x: number): CardState => ({
  id, type: TYPES[id % TYPES.length], x, opacity: 1, scale: 1, glow: 0, flash: 0, active: 0, moving: 0,
});

export function rowState(t: number, layout: RowLayout): RowState {
  const step = stepAt(t);
  const { stepIndex, u } = step;
  const n = layout.positions, pitch = layout.pitch;
  const shiftP = clamp01((u - SHIFT_AT) / SHIFT_DUR), shiftEased = ease(shiftP);
  const cards: CardState[] = [];
  for (let rel = 0; rel <= n; rel++) {
    const c = card(stepIndex + rel, positionX(Math.min(rel, n - 1), layout));
    if (rel === 0) {
      // Exit: the leftmost card slides off and fades.
      if (u >= EXIT) continue;
      const p = clamp01(u / EXIT), e = ease(p);
      c.x = positionX(0, layout) - pitch * EXIT_TRAVEL * e;
      c.opacity = 1 - p ** 1.5;
      c.scale = 1 - EXIT_SHRINK * e;
      c.flash = Math.max(0, 1 - u / FLASH_DUR);
      c.moving = 1 - e;
    } else if (rel < n) {
      // Shift: everything else moves one pitch left together.
      c.x = positionX(rel, layout) - pitch * shiftEased;
      c.moving = Math.sin(Math.PI * shiftP);
    } else {
      // Enter: the new card slides into the last position, then locks in.
      if (u < ENTER_AT) continue;
      const p = clamp01((u - ENTER_AT) / ENTER_DUR), e = ease(p);
      c.x = positionX(n - 1, layout) + ENTER_OFFSET * layout.scale * (1 - e);
      c.opacity = easeOutCubic(p / 0.6);
      c.scale = ENTER_SCALE_FROM + (1 - ENTER_SCALE_FROM) * e;
      c.moving = 1 - e;
      const g = (u - GLOW_AT) / GLOW_DUR;
      c.glow = g > 0 && g < 1 ? Math.sin(Math.PI * Math.min(1, g * 2.2)) * (1 - g) ** 0.6 : 0;
      c.active = u < GLOW_AT ? 1 : clamp01(1 - g);
    }
    cards.push(c);
  }
  return { ...step, shiftEased, cards };
}

/** Reduced motion: every position filled, nothing moving. */
export function staticRowState(layout: RowLayout): RowState {
  const cards = Array.from({ length: layout.positions }, (_, i) => card(i, positionX(i, layout)));
  return { stepIndex: 0, cycleStep: 0, u: 0, stepLength: STEP_DURATIONS[0], shiftEased: 0, cards };
}

// ── Placeholders and chevrons ──
/** The dashed box fades as a card covers its position. */
export function placeholderOpacity(cards: CardState[], position: number, layout: RowLayout) {
  const x = positionX(position, layout);
  let cover = 0;
  for (const c of cards) cover = Math.max(cover, c.opacity * Math.max(0, 1 - Math.abs(c.x - x) / (layout.pitch * COVER_REACH)));
  return 1 - COVER_STRENGTH * cover;
}

/** 0..1 highlight of the chevron between positions i and i+1. */
export function chevronHeat(u: number, i: number, positions: number) {
  const pulse = (a: number, b: number) => (u > a && u < b ? Math.sin((Math.PI * (u - a)) / (b - a)) : 0);
  if (i === positions - 2) return pulse(ENTER_AT - 0.15, GLOW_AT + 0.25);
  if (i === 0) return pulse(0, 0.45);
  return pulse(SHIFT_AT, SHIFT_AT + SHIFT_DUR) * 0.5;
}

// ── Progress ──
export interface ProgressState {
  a: number; // left edge of the fill, 0..1
  b: number; // right edge of the fill, 0..1
}

/** Grows one notch per step, then drains off the left in the cycle's last step. */
export function progressState(t: number): ProgressState {
  const { cycleStep, u, stepLength } = stepAt(t);
  const b = FILL_PER_STEP * (cycleStep + ease(clamp01((u - SHIFT_AT) / SHIFT_DUR)));
  const a = cycleStep === STEPS - 1 ? b * ease(clamp01((u - DRAIN_AT) / Math.max(0.1, stepLength - DRAIN_AT))) : 0;
  return { a, b };
}

/** Fill span inside segment i of `count`, as fractions of the segment. */
export function segmentFill({ a, b }: ProgressState, i: number, count: number) {
  const lo = clamp01(a * count - i), hi = clamp01(b * count - i);
  return { left: lo, width: Math.max(0, hi - lo) };
}

// ── Particles ──
export interface Particle {
  key: string;
  x: number; // relative to the row's center
  y: number; // relative to the row's center line
  w: number;
  h: number;
  opacity: number;
  rotate: number;
  round: boolean;
}

export function particlesAt(t: number, layout: RowLayout): Particle[] {
  const { stepIndex: j, u } = stepAt(t);
  const { cardW, cardH, pitch, scale, positions } = layout;
  const out: Particle[] = [];
  const push = (key: string, x: number, y: number, size: number, opacity: number, shape: number, rot = 0) =>
    out.push({
      key, x, y, opacity,
      w: shape === 2 ? 1.5 : size, h: shape === 2 ? 7 : size,
      rotate: shape === 1 ? 45 + rot : rot, round: shape === 0 && size <= 2,
    });

  // Poof where the leftmost card left.
  const pt = (u - BURST_AT) / BURST_DUR;
  if (pt > 0 && pt < 1) {
    const n = BURST_MIN + Math.floor(rnd(j, 1, 9) * BURST_EXTRA), p = easeOutCubic(pt);
    const x0 = positionX(0, layout) - pitch * 0.3;
    for (let i = 0; i < n; i++) {
      const r = (k: number) => rnd(j * 13 + i, 3, k);
      const angle = Math.PI + (r(1) - 0.5) * Math.PI * 1.3, dist = (26 + r(2) * 50) * scale;
      push(
        'p' + i,
        x0 + (r(3) - 0.5) * cardW * 0.6 + Math.cos(angle) * dist * p,
        (r(4) - 0.5) * cardH * 0.6 + Math.sin(angle) * dist * p - 14 * scale * p,
        2 + Math.floor(r(5) * 3), (1 - pt) ** 1.4 * (0.55 + r(6) * 0.35), Math.floor(r(7) * 3), r(8) * 180 * p,
      );
    }
  }

  // Sparks off the top edge of the card that just locked in.
  const lt = (u - GLOW_AT + 0.05) / BURST_DUR;
  if (lt > 0 && lt < 1) {
    const n = SPARK_MIN + Math.floor(rnd(j, 2, 1) * SPARK_EXTRA), p = easeOutCubic(lt);
    for (let i = 0; i < n; i++) {
      const r = (k: number) => rnd(j * 7 + i, 5, k);
      push('l' + i, positionX(positions - 1, layout) + (r(2) - 0.5) * cardW * 0.8, -cardH / 2 - 2 - p * (14 + r(3) * 22) * scale, 2, (1 - lt) * 0.7, 0);
    }
  }

  // Ambient drift. Whole turns per cycle, so it loops with everything else.
  for (let i = 0; i < AMBIENT_COUNT; i++) {
    const r = (k: number) => rnd(i, 99, k), w = (2 * Math.PI * (1 + Math.floor(r(1) * 2))) / CYCLE;
    push(
      'a' + i,
      (r(2) - 0.5) * layout.rowW * 1.28 + Math.sin(t * w + r(3) * 6) * 16,
      (r(4) - 0.5) * cardH * 2.3 + Math.cos(t * w + r(5) * 6) * 10,
      2, 0.08 + 0.14 * (0.5 + 0.5 * Math.sin(t * w * 2 + r(6) * 6)), i % 3 === 0 ? 1 : 0,
    );
  }
  return out;
}
