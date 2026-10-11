import React from 'react';

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeading({ eyebrow, title, description, action, style, ...rest }: SectionHeadingProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--zp-space-4)', flexWrap: 'wrap', ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-1)' }}>
        {eyebrow ? (
          <span style={{ font: 'var(--zp-text-micro)', letterSpacing: 'var(--zp-tracking-micro)', textTransform: 'uppercase', color: 'var(--zp-text-4)' }}>{eyebrow}</span>
        ) : null}
        <span style={{ font: 'var(--zp-text-h2)', color: 'var(--zp-text)' }}>{title}</span>
        {description ? (
          <span style={{ font: 'var(--zp-text-sm)', color: 'var(--zp-text-3)', maxWidth: '64ch', textWrap: 'pretty', marginTop: 'var(--zp-space-1)' }}>{description}</span>
        ) : null}
      </div>
      {action || null}
    </div>
  );
}
