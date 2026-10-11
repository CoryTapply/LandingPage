import { COLORS, RING_PERIOD } from './config';
import { Chevron, Icon, LoadingRing } from './icons';
import { chevronHeat, particlesAt, placeholderOpacity, positionX, type RowLayout, type RowState } from './rowState';
import { UICard } from './UICard';

interface AssemblyRowProps {
  state: RowState;
  t: number;
  layout: RowLayout;
  animated: boolean; // false under reduced motion: no particles, pulses or spinning
}

/** The decorative assembly line. Everything is positioned with transforms from the row's center. */
export function AssemblyRow({ state, t, layout, animated }: AssemblyRowProps) {
  const { positions, cardW, cardH, rowW } = layout;
  const cx = rowW / 2, cy = cardH / 2;
  const indexes = Array.from({ length: positions }, (_, i) => i);

  return (
    <div aria-hidden="true" style={{ position: 'relative', width: rowW, height: cardH, overflow: 'visible', flex: 'none' }}>
      {indexes.slice(0, -1).map((i) => (
        <div
          key={`chevron-${i}`}
          style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${cx + (positionX(i, layout) + positionX(i + 1, layout)) / 2 - 7}px, ${cy - 7}px)` }}
        >
          <Chevron heat={animated ? chevronHeat(state.u, i, positions) : 0} />
        </div>
      ))}

      {indexes.map((i) => (
        <div
          key={`slot-${i}`}
          style={{
            position: 'absolute', left: 0, top: 0, width: cardW, height: cardH, boxSizing: 'border-box',
            borderRadius: 'var(--zp-radius)', border: `1px dashed ${COLORS.cardLine}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: placeholderOpacity(state.cards, i, layout),
            transform: `translateX(${cx + positionX(i, layout) - cardW / 2}px)`,
          }}
        >
          {i === positions - 1 ? (
            <LoadingRing rotation={animated ? ((t / RING_PERIOD) * 360) % 360 : 0} />
          ) : (
            <div style={{ opacity: 0.55, display: 'flex' }}><Icon name="plus" size={16} /></div>
          )}
        </div>
      ))}

      {state.cards.map((card) => <UICard key={card.id} card={card} layout={layout} />)}

      {animated
        ? particlesAt(t, layout).map((p) => (
            <div
              key={p.key}
              style={{
                position: 'absolute', left: 0, top: 0, width: p.w, height: p.h, background: COLORS.particle,
                opacity: p.opacity, borderRadius: p.round ? 1 : 0, pointerEvents: 'none',
                transform: `translate(${cx + p.x - p.w / 2}px, ${cy + p.y - p.h / 2}px) rotate(${p.rotate}deg)`,
              }}
            />
          ))
        : null}
    </div>
  );
}
