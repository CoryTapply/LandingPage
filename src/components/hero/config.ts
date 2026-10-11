// Every tunable for the under-construction hero lives here.

// ── Copy ──
export const DEFAULT_HEADLINE = 'UNDER CONSTRUCTION';
export const DEFAULT_MESSAGE = 'We’re building something great. Check back soon!';
export const STATUS_LABEL = 'Building interface';

// ── Card order. Card `id` increases forever; type = TYPES[id % TYPES.length]. ──
export const TYPES = ['code', 'image', 'stats', 'text', 'settings', 'user'] as const;
export type CardType = (typeof TYPES)[number];

// ── Step lengths in seconds. One cycle = all steps, then the card types repeat.
//    Keep the count a multiple of TYPES.length so the loop stays seamless. ──
export const STEP_DURATIONS = [1.7, 1.9, 1.8, 1.7, 2.0, 1.8];

// ── Timing within a step (seconds from the step's start) ──
export const EXIT = 0.38; // leftmost card leaves over 0 → EXIT
export const FLASH_DUR = 0.14; // border flash on the exiting card
export const BURST_AT = 0.14; // poof particles start
export const BURST_DUR = 0.7; // poof and spark lifetime
export const SHIFT_AT = 0.12; // remaining cards start moving one pitch left
export const SHIFT_DUR = 0.6;
export const ENTER_AT = 0.66; // new card starts sliding in
export const ENTER_DUR = 0.5;
export const GLOW_AT = 1.02; // lock-in glow
export const GLOW_DUR = 0.4;
export const DRAIN_AT = 0.75; // progress bar starts draining (last step of a cycle only)

export const RING_PERIOD = 1.1; // seconds per turn of the loading ring
export const DOTS_PER_SECOND = 2.5; // "BUILDING INTERFACE..." dot changes

// ── Motion distances ──
export const EXIT_TRAVEL = 0.4; // × pitch
export const EXIT_SHRINK = 0.08;
export const ENTER_OFFSET = 50; // px at desktop size, scales with the card
export const ENTER_SCALE_FROM = 0.97;
export const COVER_REACH = 0.55; // × pitch: how far a card hides the placeholder under it
export const COVER_STRENGTH = 0.94;

// ── Sizes per breakpoint (viewport width, CSS px) ──
export const BREAKPOINTS = { tablet: 640, desktop: 1100 };
export interface RowSize {
  positions: number;
  cardW: number;
  cardH: number;
  pitch: number; // center to center
}
export const SIZES: Record<'desktop' | 'tablet' | 'mobile', RowSize> = {
  desktop: { positions: 4, cardW: 184, cardH: 112, pitch: 250 },
  tablet: { positions: 4, cardW: 156, cardH: 95, pitch: 212 },
  mobile: { positions: 3, cardW: 136, cardH: 84, pitch: 160 },
};
// Card contents are authored at this width and scaled to the real card.
export const DESIGN_CARD_W = SIZES.desktop.cardW;
export const CARD_PADDING = '14px 16px'; // at design width; 10px/12px once scaled to mobile
export const MIN_GAP = 18; // smallest gap between cards when the row has to squeeze (fits the 14px chevron)
export const MIN_ICON = 14; // icons never render smaller than this
export const ICON_SIZE = 18;
export const COMPACT_BELOW = 0.7; // card scale under which each card drops its third line
export const HERO_GUTTER = 16; // hero side padding, used for the first layout guess

// ── Particles (at most 12 + 5 + 8 = 25 nodes) ──
export const BURST_MIN = 8;
export const BURST_EXTRA = 5; // 8–12
export const SPARK_MIN = 3;
export const SPARK_EXTRA = 3; // 3–5
export const AMBIENT_COUNT = 8;

// ── Progress bar ──
export const SEGMENTS = 12;
export const FILL_PER_STEP = 0.12; // six steps reach ~72%
export const STATIC_FILL = 0.5; // reduced motion

// ── Colors with no Zerpy token (card skeleton tints from the design reference) ──
export const COLORS = {
  cardSurface: 'linear-gradient(180deg, rgba(30,29,52,.96), rgba(18,18,34,.96))',
  cardLine: 'rgba(150,145,200,.28)',
  icon: 'rgba(196,187,255,.78)',
  lineStrong: 'rgba(214,211,238,.48)',
  lineMid: 'rgba(190,186,220,.26)',
  lineFaint: 'rgba(170,166,210,.15)',
  particle: 'rgba(214,208,255,.9)',
};
