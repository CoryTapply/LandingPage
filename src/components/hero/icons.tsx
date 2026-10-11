import type { ReactNode } from 'react';
import { COLORS, ICON_SIZE } from './config';

// Inline SVG icons (Lucide weight). No icon library.
const PATHS = {
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />,
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M21 16l-5-5-9 9" />
    </>
  ),
  stats: <path d="M5 20V12M12 20V5M19 20v-5" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" />
    </>
  ),
  plus: <path d="M12 6v12M6 12h12" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = ICON_SIZE }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={COLORS.icon} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {PATHS[name]}
    </svg>
  );
}

export function LoadingRing({ rotation }: { rotation: number }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" style={{ transform: `rotate(${rotation}deg)` }}>
      <circle cx="13" cy="13" r="10" fill="none" strokeWidth="1.6" style={{ stroke: 'var(--zp-line)' }} />
      <path d="M13 3 A10 10 0 0 1 23 13" fill="none" strokeWidth="1.6" strokeLinecap="round" opacity=".8" style={{ stroke: 'var(--zp-accent-400)' }} />
    </svg>
  );
}

/** `heat` 0..1 brightens the chevron as a card passes through its gap. */
export function Chevron({ heat }: { heat: number }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      <path
        d="M9 5l7 7-7 7" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        strokeOpacity={0.35 + 0.6 * heat}
        style={{ stroke: heat > 0.02 ? 'var(--zp-accent-300)' : COLORS.icon }}
      />
    </svg>
  );
}
