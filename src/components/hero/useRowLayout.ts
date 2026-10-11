import { useEffect, useState, type RefObject } from 'react';
import { HERO_GUTTER } from './config';
import { computeLayout, type RowLayout } from './rowState';

const guess = () => {
  const vw = typeof window === 'undefined' ? 1280 : window.innerWidth;
  return computeLayout(vw, vw - HERO_GUTTER * 2);
};

/** Position count and card dimensions, derived from the viewport and the width `target` has. */
export function useRowLayout(target: RefObject<Element | null>): RowLayout {
  const [layout, setLayout] = useState(guess);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const measure = () => {
      const next = computeLayout(window.innerWidth, el.clientWidth);
      setLayout((prev) =>
        prev.positions === next.positions && prev.cardW === next.cardW && prev.cardH === next.cardH && prev.pitch === next.pitch ? prev : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [target]);

  return layout;
}

/** Tracks `prefers-reduced-motion: reduce`. */
export function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}
