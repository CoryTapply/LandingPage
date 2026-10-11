import { useRef } from 'react';
import styles from './ConstructionHero.module.css';
import { AssemblyRow } from './AssemblyRow';
import { DEFAULT_HEADLINE, DEFAULT_MESSAGE, DOTS_PER_SECOND, SEGMENTS, STATIC_FILL, STATUS_LABEL } from './config';
import { progressState, rowState, segmentFill, staticRowState, type ProgressState } from './rowState';
import { useAnimationClock } from './useAnimationClock';
import { usePrefersReducedMotion, useRowLayout } from './useRowLayout';

export interface ConstructionHeroProps {
  headline?: string;
  message?: string;
}

function Progress({ progress, dots }: { progress: ProgressState; dots: number }) {
  return (
    <div className={styles.progress}>
      <div className={styles.bar} aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const fill = segmentFill(progress, i, SEGMENTS);
          return (
            <div key={i} className={styles.segment}>
              <div className={styles.fill} style={{ left: `${fill.left * 100}%`, width: `${fill.width * 100}%` }} />
            </div>
          );
        })}
      </div>
      <div className={styles.status}>
        <span role="status">{STATUS_LABEL}</span>
        <span className={styles.dots} aria-hidden="true">{'.'.repeat(dots)}</span>
      </div>
    </div>
  );
}

export function ConstructionHero({ headline = DEFAULT_HEADLINE, message = DEFAULT_MESSAGE }: ConstructionHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const rowSpaceRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const layout = useRowLayout(rowSpaceRef);
  // The one clock. Under reduced motion it never starts and the row is static.
  const t = useAnimationClock(heroRef, !reducedMotion);

  const state = reducedMotion ? staticRowState(layout) : rowState(t, layout);
  const progress = reducedMotion ? { a: 0, b: STATIC_FILL } : progressState(t);
  const dots = reducedMotion ? 3 : Math.floor(t * DOTS_PER_SECOND) % 4;

  return (
    <section ref={heroRef} className={styles.hero}>
      <h1 className={styles.headline}>{headline}</h1>
      <p className={styles.message}>{message}</p>
      <div ref={rowSpaceRef} className={styles.rowSpace}>
        <AssemblyRow state={state} t={t} layout={layout} animated={!reducedMotion} />
      </div>
      <Progress progress={progress} dots={dots} />
    </section>
  );
}
