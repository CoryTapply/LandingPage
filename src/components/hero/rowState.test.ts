import { describe, expect, it } from 'vitest';
import { ENTER_AT, ENTER_DUR, EXIT, SEGMENTS, STEP_DURATIONS, TYPES } from './config';
import {
  CYCLE, computeLayout, particlesAt, placeholderOpacity, positionX, progressState, rowState, segmentFill,
  staticRowState, stepAt,
} from './rowState';

const desktop = computeLayout(1600, 1568);
const mobile = computeLayout(390, 358);
const stepStarts = STEP_DURATIONS.map((_, i) => STEP_DURATIONS.slice(0, i).reduce((a, b) => a + b, 0));

describe('computeLayout', () => {
  it('uses the authored sizes when there is room', () => {
    expect(desktop).toMatchObject({ positions: 4, cardW: 184, cardH: 112, pitch: 250, rowW: 934, scale: 1 });
    expect(computeLayout(900, 868)).toMatchObject({ positions: 4, cardW: 156, cardH: 95, pitch: 212 });
    expect(computeLayout(600, 568)).toMatchObject({ positions: 3, cardW: 136, cardH: 84, pitch: 160 });
  });

  it('never makes the row wider than the space it has', () => {
    for (const vw of [320, 360, 414, 639, 640, 700, 820, 1099, 1100]) {
      const available = vw - 32;
      const layout = computeLayout(vw, available);
      expect(layout.rowW).toBeLessThanOrEqual(available + 1e-6);
      expect(layout.pitch).toBeGreaterThan(layout.cardW);
    }
    expect(computeLayout(320, 288).positions).toBe(3);
  });
});

describe('rowState', () => {
  it('keeps card ids stable across a step', () => {
    for (const layout of [desktop, mobile]) {
      const n = layout.positions;
      stepStarts.forEach((start, j) => {
        for (let u = 0; u < STEP_DURATIONS[j]; u += 0.05) {
          const st = rowState(start + u, layout);
          expect(st.stepIndex).toBe(j);
          const ids = st.cards.map((c) => c.id);
          // The shifting cards are always present, in order, with the same ids.
          for (let rel = 1; rel < n; rel++) expect(ids).toContain(j + rel);
          for (const id of ids) {
            expect(id).toBeGreaterThanOrEqual(j);
            expect(id).toBeLessThanOrEqual(j + n);
          }
          expect(new Set(ids).size).toBe(ids.length);
        }
      });
    }
  });

  it('removes the leftmost card after EXIT', () => {
    stepStarts.forEach((start, j) => {
      expect(rowState(start + EXIT / 2, desktop).cards.some((c) => c.id === j)).toBe(true);
      expect(rowState(start + EXIT + 0.001, desktop).cards.some((c) => c.id === j)).toBe(false);
    });
  });

  it('seats the new card at the last position after ENTER_AT + ENTER_DUR', () => {
    for (const layout of [desktop, mobile]) {
      const n = layout.positions;
      stepStarts.forEach((start, j) => {
        expect(rowState(start + ENTER_AT - 0.001, layout).cards.some((c) => c.id === j + n)).toBe(false);
        const added = rowState(start + ENTER_AT + ENTER_DUR + 0.001, layout).cards.find((c) => c.id === j + n);
        expect(added).toBeDefined();
        expect(added!.x).toBeCloseTo(positionX(n - 1, layout), 6);
        expect(added!.opacity).toBeCloseTo(1, 6);
        expect(added!.scale).toBeCloseTo(1, 6);
      });
    }
  });

  it('ends every step in the shape the next one starts in', () => {
    stepStarts.forEach((start, j) => {
      const end = rowState(start + STEP_DURATIONS[j] - 1e-6, desktop).cards;
      const next = rowState(start + STEP_DURATIONS[j] + 1e-6, desktop).cards;
      expect(end.map((c) => c.id)).toEqual(next.map((c) => c.id));
      end.forEach((c, i) => {
        expect(c.x).toBeCloseTo(next[i].x, 2);
        expect(c.opacity).toBeCloseTo(next[i].opacity, 2);
        expect(c.glow).toBeCloseTo(0, 3);
      });
    });
  });

  it('repeats card types every cycle while ids keep counting', () => {
    for (const t of [0.2, 3.1, 7.77, 10.5]) {
      const a = rowState(t, desktop), b = rowState(t + CYCLE, desktop);
      expect(b.stepIndex).toBe(a.stepIndex + STEP_DURATIONS.length);
      expect(b.cards.map((c) => c.type)).toEqual(a.cards.map((c) => c.type));
      b.cards.forEach((c, i) => expect(c.x).toBeCloseTo(a.cards[i].x, 6));
    }
    expect(rowState(0, desktop).cards[0].type).toBe(TYPES[0]);
  });

  it('hides placeholders under settled cards and shows the last one mid-step', () => {
    const settled = rowState(stepStarts[1] - 0.01, desktop);
    for (let i = 0; i < 4; i++) expect(placeholderOpacity(settled.cards, i, desktop)).toBeLessThan(0.07);
    const mid = rowState(SHIFT_END, desktop);
    expect(placeholderOpacity(mid.cards, 3, desktop)).toBeGreaterThan(0.9);
  });

  it('fills every position when static', () => {
    const st = staticRowState(mobile);
    expect(st.cards).toHaveLength(3);
    for (let i = 0; i < 3; i++) expect(placeholderOpacity(st.cards, i, mobile)).toBeLessThan(0.07);
  });
});

const SHIFT_END = 0.6; // shift nearly done, new card not yet entering

describe('progressState', () => {
  const filled = (t: number) => {
    const p = progressState(t);
    let sum = 0;
    for (let i = 0; i < SEGMENTS; i++) sum += segmentFill(p, i, SEGMENTS).width;
    return sum / SEGMENTS;
  };

  it('is empty on both sides of the cycle boundary', () => {
    expect(filled(0)).toBeCloseTo(0, 6);
    expect(filled(CYCLE - 1e-6)).toBeCloseTo(0, 4);
    expect(filled(CYCLE + 1e-6)).toBeCloseTo(0, 4);
    const end = progressState(CYCLE - 1e-6);
    expect(end.a).toBeCloseTo(end.b, 4);
  });

  it('grows through the cycle and repeats', () => {
    expect(filled(stepStarts[3] - 0.01)).toBeCloseTo(0.36, 6);
    expect(progressState(stepStarts[5] + 0.74).b).toBeCloseTo(0.72, 6);
    expect(progressState(4.2 + CYCLE).b).toBeCloseTo(progressState(4.2).b, 6);
  });
});

describe('particles and steps', () => {
  it('never renders more than 25 particles', () => {
    for (let t = 0; t < CYCLE * 2; t += 0.03) expect(particlesAt(t, desktop).length).toBeLessThanOrEqual(25);
  });

  it('maps time to steps', () => {
    expect(stepAt(0)).toMatchObject({ stepIndex: 0, u: 0 });
    expect(stepAt(1.7).stepIndex).toBe(1);
    expect(stepAt(CYCLE + 1.75).stepIndex).toBe(7);
    expect(CYCLE).toBeCloseTo(10.9, 9);
  });
});
