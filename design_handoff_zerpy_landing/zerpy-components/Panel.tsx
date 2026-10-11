import React from 'react';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 'flat' | 'panel' | 'overlay';
  padding?: number | string;
}

export function Panel({ elevation = 'panel', padding = 'var(--zp-space-6)', children, style, ...rest }: PanelProps) {
  const overlay = elevation === 'overlay';
  return (
    <div
      style={{
        boxSizing: 'border-box', padding,
        borderRadius: overlay ? 'var(--zp-radius-md)' : 'var(--zp-radius)',
        border: `1px solid ${overlay ? 'var(--zp-line-strong)' : 'var(--zp-line)'}`,
        background: overlay ? 'var(--zp-surface-overlay)' : elevation === 'flat' ? 'var(--zp-surface-1)' : 'var(--zp-surface-panel)',
        backdropFilter: elevation === 'flat' ? undefined : `blur(var(--zp-blur-${overlay ? 'lg' : 'md'}))`,
        boxShadow: elevation === 'flat' ? 'var(--zp-elev-flat)' : overlay ? 'var(--zp-elev-overlay)' : 'var(--zp-elev-panel)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
