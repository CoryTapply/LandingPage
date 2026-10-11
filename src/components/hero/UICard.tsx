import { memo, type CSSProperties, type ReactNode } from 'react';
import { CARD_PADDING, COLORS, DESIGN_CARD_W, ICON_SIZE, MIN_ICON, type CardType } from './config';
import { Icon } from './icons';
import type { CardState, RowLayout } from './rowState';

const Ln = ({ w, c = COLORS.lineMid, h = 6 }: { w: number; c?: string; h?: number }) => (
  <div style={{ width: w, height: h, borderRadius: 2, background: c, flexShrink: 0 }} />
);
const Col = ({ gap = 7, children, style }: { gap?: number; children: ReactNode; style?: CSSProperties }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>
);
const Row = ({ gap = 8, children, style }: { gap?: number; children: ReactNode; style?: CSSProperties }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap, ...style }}>{children}</div>
);

interface CardBodyProps {
  type: CardType;
  iconSize: number;
  compact: boolean; // drop each card's third line when the card is small
}

// Memoized: per frame only the shell's transform/opacity/border/shadow change.
const CardBody = memo(function CardBody({ type, iconSize, compact }: CardBodyProps) {
  switch (type) {
    case 'code':
      return (
        <Col gap={9}>
          <Row><Icon name="code" size={iconSize} /><Ln w={58} c={COLORS.lineStrong} /></Row>
          <Col gap={7}>
            <Row gap={5}><Ln w={22} c="rgba(169,156,240,.45)" /><Ln w={70} /></Row>
            <Row gap={5} style={{ paddingLeft: 14 }}><Ln w={40} c="rgba(169,156,240,.32)" /><Ln w={46} c={COLORS.lineFaint} /></Row>
            {compact ? null : <Row gap={5}><Ln w={30} c={COLORS.lineFaint} /></Row>}
          </Col>
        </Col>
      );
    case 'image':
      return (
        <Col gap={8}>
          <div style={{ height: 44, borderRadius: 2, background: 'rgba(145,132,217,.10)', border: '1px solid var(--zp-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="image" size={iconSize} />
          </div>
          <Ln w={92} c={COLORS.lineStrong} />
          {compact ? null : <Ln w={64} c={COLORS.lineFaint} />}
        </Col>
      );
    case 'stats':
      return (
        <Row gap={14} style={{ alignItems: 'flex-end', height: '100%' }}>
          <Row gap={5} style={{ alignItems: 'flex-end', height: 62 }}>
            {[30, 54, 40].map((h, i) => (
              <div key={i} style={{ width: 11, height: h, borderRadius: 2, background: i === 1 ? 'rgba(169,156,240,.55)' : 'rgba(169,156,240,.26)' }} />
            ))}
          </Row>
          <Col gap={8} style={{ paddingBottom: 2 }}>
            <Icon name="stats" size={iconSize} />
            <Ln w={58} c={COLORS.lineStrong} />
            {compact ? null : <Ln w={42} c={COLORS.lineFaint} />}
          </Col>
        </Row>
      );
    case 'text':
      return (
        <Col gap={10} style={{ paddingTop: 4 }}>
          <Ln w={84} c={COLORS.lineStrong} h={7} />
          <Ln w={146} />
          <Ln w={128} />
          {compact ? null : <Ln w={96} c={COLORS.lineFaint} />}
        </Col>
      );
    case 'settings':
      return (
        <Col gap={10}>
          <Row><Icon name="settings" size={iconSize} /><Ln w={60} c={COLORS.lineStrong} /></Row>
          {(compact ? [0] : [0, 1]).map((i) => (
            <Row key={i} style={{ justifyContent: 'space-between' }}>
              <Ln w={i ? 54 : 74} c={COLORS.lineFaint} />
              <div style={{ width: 22, height: 12, borderRadius: 6, border: `1px solid ${COLORS.cardLine}`, background: i ? 'transparent' : 'var(--zp-accent-tint-strong)', position: 'relative', boxSizing: 'content-box' }}>
                <div style={{ position: 'absolute', top: 2, left: i ? 2 : 12, width: 6, height: 6, borderRadius: 3, background: i ? COLORS.lineMid : 'var(--zp-accent-300)' }} />
              </div>
            </Row>
          ))}
        </Col>
      );
    case 'user':
      return (
        <Col gap={12}>
          <Row gap={10}>
            <div style={{ width: 34, height: 34, borderRadius: 17, border: `1.5px solid ${COLORS.icon}`, position: 'relative', overflow: 'hidden', flexShrink: 0, boxSizing: 'content-box' }}>
              <div style={{ position: 'absolute', left: 11, top: 7, width: 10, height: 10, borderRadius: 5, border: `1.5px solid ${COLORS.icon}`, boxSizing: 'content-box' }} />
              <div style={{ position: 'absolute', left: 5, top: 21, width: 22, height: 18, borderRadius: 11, border: `1.5px solid ${COLORS.icon}`, boxSizing: 'content-box' }} />
            </div>
            <Col gap={7}><Ln w={70} c={COLORS.lineStrong} /><Ln w={48} c={COLORS.lineFaint} /></Col>
          </Row>
          {compact ? null : <Ln w={140} c={COLORS.lineFaint} />}
        </Col>
      );
  }
});

function borderColor(c: CardState) {
  if (c.flash > 0) return `rgba(220,214,255,${0.5 + 0.45 * c.flash})`;
  if (c.glow > 0.02 || c.active > 0.02) return `rgba(169,156,240,${0.3 + 0.25 * c.active + 0.25 * c.glow})`;
  return COLORS.cardLine;
}

export function UICard({ card: c, layout }: { card: CardState; layout: RowLayout }) {
  const { cardW, cardH, rowW, scale } = layout;
  const halo = Math.max(c.glow, c.flash * 0.8);
  // Contents are laid out at the design width and scaled to the card; icons are
  // sized up to compensate so they never drop below MIN_ICON on screen.
  const iconSize = Math.max(ICON_SIZE, Math.ceil(MIN_ICON / scale));
  return (
    <div
      style={{
        position: 'absolute', left: 0, top: 0, width: cardW, height: cardH, boxSizing: 'border-box',
        borderRadius: 'var(--zp-radius)', background: COLORS.cardSurface, border: `1px solid ${borderColor(c)}`,
        opacity: c.opacity,
        boxShadow: `0 ${10 + 8 * c.moving}px ${28 + 14 * c.moving}px rgba(0,0,0,${0.35 + 0.12 * c.moving}), inset 0 1px 0 rgba(255,255,255,.05), 0 0 ${24 * halo}px rgba(145,132,217,${0.45 * halo})`,
        transform: `translate(${rowW / 2 + c.x - cardW / 2}px, ${-2 * c.moving}px) scale(${c.scale})`,
      }}
    >
      <div
        style={{
          position: 'absolute', left: -1, top: -1, width: DESIGN_CARD_W, height: cardH / scale, boxSizing: 'border-box',
          padding: CARD_PADDING, overflow: 'hidden', textAlign: 'left',
          transform: scale === 1 ? undefined : `scale(${scale})`, transformOrigin: '0 0',
        }}
      >
        <CardBody type={c.type} iconSize={iconSize} compact={layout.compact} />
      </div>
    </div>
  );
}
