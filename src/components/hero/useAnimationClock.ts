import { useEffect, useRef, useState, type RefObject } from 'react';

// A frame longer than this counts as a stall, not as elapsed animation time.
const MAX_FRAME_MS = 100;

/**
 * The hero's single clock: one requestAnimationFrame loop returning elapsed
 * seconds. It stops while `target` is off-screen or the tab is hidden, and
 * picks up where it left off, so resuming never jumps.
 */
export function useAnimationClock(target: RefObject<Element | null>, enabled = true): number {
  const [seconds, setSeconds] = useState(0);
  const elapsedMs = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let last: number | null = null;
    let onScreen = true;

    const tick = (now: number) => {
      if (last !== null) elapsedMs.current += Math.min(now - last, MAX_FRAME_MS);
      last = now;
      setSeconds(elapsedMs.current / 1000);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      const shouldRun = onScreen && !document.hidden;
      if (shouldRun && !frame) {
        frame = requestAnimationFrame(tick);
      } else if (!shouldRun && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = null;
      }
    };

    let observer: IntersectionObserver | undefined;
    if (target.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      });
      observer.observe(target.current);
    }
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      observer?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [enabled, target]);

  return seconds;
}
