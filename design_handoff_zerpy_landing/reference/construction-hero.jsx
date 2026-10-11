// Under-construction hero: UI cards assemble, lock in, poof, rebuild. All motion keyed to T.
const W = 1600, H = 900;
// Zerpy tokens (literal so they survive video export)
const C = {
  ground: 'radial-gradient(110% 70% at 15% -10%, rgba(74,62,140,.34) 0%, rgba(74,62,140,0) 60%), radial-gradient(90% 60% at 90% 5%, rgba(96,64,132,.22) 0%, rgba(96,64,132,0) 55%), linear-gradient(180deg, #0d0e18 0%, #0b0c14 60%, #08080f 100%)',
  stars: 'radial-gradient(1px 1px at 14% 20%, #fff, transparent), radial-gradient(1px 1px at 38% 9%, #cfc9ff, transparent), radial-gradient(1.3px 1.3px at 61% 28%, #fff, transparent), radial-gradient(1px 1px at 79% 14%, #bfe0ff, transparent), radial-gradient(1px 1px at 24% 66%, #e6dcff, transparent), radial-gradient(1.2px 1.2px at 49% 82%, #fff, transparent), radial-gradient(1px 1px at 71% 71%, #cfc9ff, transparent), radial-gradient(1px 1px at 93% 88%, #fff, transparent)',
  card: 'linear-gradient(180deg, rgba(30,29,52,.96), rgba(18,18,34,.96))',
  line: 'rgba(150,145,200,.14)', lineStrong: 'rgba(150,145,200,.28)', lineAccent: 'rgba(169,156,240,.55)',
  text: '#f2f1fb', text3: 'rgba(206,203,232,.60)', text4: 'rgba(190,186,220,.45)',
  accent: '#9184d9', a300: '#c4bbff', a400: '#a99cf0', a800: '#423a6d',
  icon: 'rgba(196,187,255,.78)',
  l1: 'rgba(214,211,238,.48)', l2: 'rgba(190,186,220,.26)', l3: 'rgba(170,166,210,.15)',
  ui: "'Instrument Sans', system-ui, sans-serif", mono: "'Roboto Mono', ui-monospace, monospace",
};

// Three motion helpers. enter = Zerpy's one curve cubic-bezier(.2,.7,.3,1).
function bez(x1, y1, x2, y2) {
  const f = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 18; i++) { t = (lo + hi) / 2; if (f(t, x1, x2) < x) lo = t; else hi = t; } return f(t, y1, y2); };
}
const cl = (v) => Math.max(0, Math.min(1, v));
const MOTION = {
  enter: bez(.2, .7, .3, 1),
  fade: (p) => 1 - (1 - cl(p)) ** 3,
  poof: (p) => cl(p) ** 2,
};
const ENTER = 0.42, GLOW = 0.5, POOF = 0.4, BURST = 0.7;
const rnd = (a, b, c) => { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return x - Math.floor(x); };

// ── Icons (1.5px stroke, Lucide weight) ──
const Ico = ({ children, s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={C.icon} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const ICONS = {
  code: <Ico><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" /></Ico>,
  image: <Ico><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-9 9" /></Ico>,
  stats: <Ico><path d="M5 20V12M12 20V5M19 20v-5" /></Ico>,
  settings: <Ico><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" /></Ico>,
  plus: <Ico s={16}><path d="M12 6v12M6 12h12" /></Ico>,
};
const Ln = ({ w, c = C.l2, h = 6 }) => <div style={{ width: w, height: h, borderRadius: 2, background: c, flexShrink: 0 }} />;
const Col = ({ gap = 7, children, style }) => <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>;
const Row = ({ gap = 8, children, style }) => <div style={{ display: 'flex', alignItems: 'center', gap, ...style }}>{children}</div>;

function CardBody({ type }) {
  switch (type) {
    case 'code': return (
      <Col gap={9}>
        <Row>{ICONS.code}<Ln w={58} c={C.l1} /></Row>
        <Col gap={7} style={{ fontFamily: C.mono }}>
          <Row gap={5}><Ln w={22} c="rgba(169,156,240,.45)" /><Ln w={70} /></Row>
          <Row gap={5} style={{ paddingLeft: 14 }}><Ln w={40} c="rgba(169,156,240,.32)" /><Ln w={46} c={C.l3} /></Row>
          <Row gap={5}><Ln w={30} c={C.l3} /></Row>
        </Col>
      </Col>);
    case 'image': return (
      <Col gap={8}>
        <div style={{ height: 44, borderRadius: 2, background: 'rgba(145,132,217,.10)', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.image}</div>
        <Ln w={92} c={C.l1} /><Ln w={64} c={C.l3} />
      </Col>);
    case 'stats': return (
      <Row gap={14} style={{ alignItems: 'flex-end', height: '100%' }}>
        <Row gap={5} style={{ alignItems: 'flex-end', height: 62 }}>
          {[30, 54, 40].map((h, i) => <div key={i} style={{ width: 11, height: h, borderRadius: 2, background: i === 1 ? 'rgba(169,156,240,.55)' : 'rgba(169,156,240,.26)' }} />)}
        </Row>
        <Col gap={8} style={{ paddingBottom: 2 }}>{ICONS.stats}<Ln w={58} c={C.l1} /><Ln w={42} c={C.l3} /></Col>
      </Row>);
    case 'text': return (
      <Col gap={10} style={{ paddingTop: 4 }}>
        <Ln w={84} c={C.l1} h={7} /><Ln w={146} /><Ln w={128} /><Ln w={96} c={C.l3} />
      </Col>);
    case 'settings': return (
      <Col gap={10}>
        <Row>{ICONS.settings}<Ln w={60} c={C.l1} /></Row>
        {[0, 1].map((i) => (
          <Row key={i} style={{ justifyContent: 'space-between' }}>
            <Ln w={i ? 54 : 74} c={C.l3} />
            <div style={{ width: 22, height: 12, borderRadius: 6, border: `1px solid ${C.lineStrong}`, background: i ? 'transparent' : 'rgba(145,132,217,.28)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 2, left: i ? 2 : 12, width: 6, height: 6, borderRadius: 3, background: i ? C.l2 : C.a300 }} />
            </div>
          </Row>))}
      </Col>);
    case 'user': return (
      <Col gap={12}>
        <Row gap={10}>
          <div style={{ width: 34, height: 34, borderRadius: 17, border: `1.5px solid ${C.icon}`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ position: 'absolute', left: 11, top: 7, width: 10, height: 10, borderRadius: 5, border: `1.5px solid ${C.icon}` }} />
            <div style={{ position: 'absolute', left: 5, top: 21, width: 22, height: 18, borderRadius: 11, border: `1.5px solid ${C.icon}` }} />
          </div>
          <Col gap={7}><Ln w={70} c={C.l1} /><Ln w={48} c={C.l3} /></Col>
        </Row>
        <Ln w={140} c={C.l3} />
      </Col>);
    case 'layout': return (
      <Col gap={10} style={{ height: '100%' }}>
        <Row gap={5}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: C.l2 }} />)}<div style={{ flex: 1, height: 8, marginLeft: 8, borderRadius: 2, background: C.l3 }} /></Row>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '44px 1fr 1fr', gridTemplateRows: '1fr 30px', gap: 6 }}>
          <Col gap={6} style={{ gridRow: 'span 2', paddingTop: 2 }}><Ln w={36} c={C.l1} /><Ln w={30} c={C.l3} /><Ln w={34} c={C.l3} /><Ln w={26} c={C.l3} /></Col>
          <div style={{ gridColumn: 'span 2', borderRadius: 2, background: 'rgba(145,132,217,.12)', border: `1px solid ${C.line}` }} />
          <div style={{ borderRadius: 2, border: `1px solid ${C.line}`, background: 'rgba(255,255,255,.03)' }} />
          <div style={{ borderRadius: 2, border: `1px solid ${C.line}`, background: 'rgba(255,255,255,.03)' }} />
        </div>
      </Col>);
  }
  return null;
}


const SP = 250, CW = 184, CH = 112, RY = 500;
const X = (s) => 800 + (s - 1.5) * SP;
const TYPES = ['code', 'image', 'stats', 'text', 'settings', 'user'];
const STEP_NAMES = ['Settings in', 'Profile in', 'Code in', 'Image in', 'Chart in', 'Text in'];
// per-step offsets (authored seconds from the step's cue)
const EXD = 0.38, BURST0 = 0.14, SH0 = 0.12, SHD = 0.6, IN0 = 0.66, IND = 0.5, GL0 = 1.02, GLD = 0.4;

// The controller: everything visible derives from (step j, local time u).
function rowState(T, starts, total) {
  let j = 0;
  for (let i = 0; i < starts.length; i++) if (T >= starts[i]) j = i;
  const u = T - starts[j];
  const stepEnd = j + 1 < starts.length ? starts[j + 1] : total;
  const shiftP = cl((u - SH0) / SHD), shiftE = MOTION.enter(shiftP);
  const cards = [];
  for (let rel = 0; rel < 5; rel++) {
    const id = j + rel, c = { id, type: TYPES[id % 6], x: X(rel), op: 1, sc: 1, glow: 0, flash: 0, active: 0, moving: 0 };
    if (rel === 0) {
      if (u >= EXD) continue;
      const p = cl(u / EXD), e = MOTION.enter(p);
      c.x = X(0) - SP * 0.4 * e; c.op = 1 - p ** 1.5; c.sc = 1 - 0.08 * e;
      c.flash = Math.max(0, 1 - u / 0.14); c.moving = 1 - e;
    } else if (rel < 4) {
      c.x = X(rel) - SP * shiftE; c.moving = Math.sin(Math.PI * shiftP);
    } else {
      if (u < IN0) continue;
      const p = cl((u - IN0) / IND), e = MOTION.enter(p);
      c.x = X(3) + 50 * (1 - e); c.op = MOTION.fade(cl(p / 0.6)); c.sc = 0.97 + 0.03 * e; c.moving = 1 - e;
      const g = (u - GL0) / GLD;
      c.glow = g > 0 && g < 1 ? Math.sin(Math.PI * Math.min(1, g * 2.2)) * (1 - g) ** 0.6 : 0;
      c.active = u < GL0 ? 1 : cl(1 - g);
    }
    cards.push(c);
  }
  return { j, u, stepEnd: stepEnd - starts[j], shiftE, cards };
}

function Card({ c }) {
  const border = c.flash > 0 ? `rgba(220,214,255,${.5 + .45 * c.flash})`
    : (c.glow > .02 || c.active > .02) ? `rgba(169,156,240,${.3 + .25 * c.active + .25 * c.glow})` : C.lineStrong;
  const halo = Math.max(c.glow, c.flash * .8);
  return (
    <div style={{
      position: 'absolute', left: c.x - CW / 2, top: RY - CH / 2, width: CW, height: CH, boxSizing: 'border-box',
      padding: '14px 16px', borderRadius: 4, background: C.card, border: `1px solid ${border}`, opacity: c.op,
      boxShadow: `0 ${10 + 8 * c.moving}px ${28 + 14 * c.moving}px rgba(0,0,0,${.35 + .12 * c.moving}), inset 0 1px 0 rgba(255,255,255,.05), 0 0 ${24 * halo}px rgba(145,132,217,${.45 * halo})`,
      transform: `translateY(${-2 * c.moving}px) scale(${c.sc})`,
    }}>
      <CardBody type={c.type} />
    </div>
  );
}

function Placeholders({ cards, T, total }) {
  const rot = (T / total) * 360 * Math.round(total / 1.1);
  return [0, 1, 2, 3].map((s) => {
    let cover = 0;
    for (const c of cards) cover = Math.max(cover, c.op * Math.max(0, 1 - Math.abs(c.x - X(s)) / (SP * 0.55)));
    return (
      <div key={s} style={{ position: 'absolute', left: X(s) - CW / 2, top: RY - CH / 2, width: CW, height: CH, boxSizing: 'border-box',
        borderRadius: 4, border: `1px dashed ${C.lineStrong}`, opacity: 1 - 0.94 * cover, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {s === 3 ? (
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" style={{ transform: `rotate(${rot}deg)` }}>
            <circle cx="13" cy="13" r="10" fill="none" stroke={C.line} strokeWidth="1.6" />
            <path d="M13 3 A10 10 0 0 1 23 13" fill="none" stroke={C.a400} strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
          </svg>
        ) : <div style={{ opacity: .55 }}>{ICONS.plus}</div>}
      </div>
    );
  });
}

function Chevrons({ u }) {
  const pulse = (a, b) => (u > a && u < b ? Math.sin(Math.PI * (u - a) / (b - a)) : 0);
  return [0, 1, 2].map((i) => {
    const hot = i === 2 ? pulse(IN0 - .15, GL0 + .25) : i === 0 ? pulse(0, .45) : pulse(SH0, SH0 + SHD) * .5;
    return (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
        style={{ position: 'absolute', left: (X(i) + X(i + 1)) / 2 - 7, top: RY - 7 }}>
        <path d="M9 5l7 7-7 7" fill="none" stroke={hot > .02 ? C.a300 : C.icon} strokeOpacity={.35 + .6 * hot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  });
}

function Particles({ st, T, on, total }) {
  if (!on) return null;
  const { j, u } = st, out = [];
  const pt = (u - BURST0) / BURST;
  if (pt > 0 && pt < 1) {
    const n = 8 + Math.floor(rnd(j, 1, 9) * 5), p = MOTION.fade(pt), x0 = X(0) - SP * 0.3;
    for (let i = 0; i < n; i++) {
      const r = (k) => rnd(j * 13 + i, 3, k);
      const a = Math.PI + (r(1) - .5) * Math.PI * 1.3, dist = 26 + r(2) * 50;
      out.push({ key: 'p' + i, x: x0 + (r(3) - .5) * CW * .6 + Math.cos(a) * dist * p, y: RY + (r(4) - .5) * CH * .6 + Math.sin(a) * dist * p - 14 * p,
        sz: 2 + Math.floor(r(5) * 3), o: (1 - pt) ** 1.4 * (.55 + r(6) * .35), shape: Math.floor(r(7) * 3), rot: r(8) * 180 * p });
    }
  }
  const lt = (u - GL0 + .05) / BURST;
  if (lt > 0 && lt < 1) {
    const n = 3 + Math.floor(rnd(j, 2, 1) * 3), p = MOTION.fade(lt);
    for (let i = 0; i < n; i++) {
      const r = (k) => rnd(j * 7 + i, 5, k);
      out.push({ key: 'l' + i, x: X(3) + (r(2) - .5) * CW * .8, y: RY - CH / 2 - 2 - p * (14 + r(3) * 22), sz: 2, o: (1 - lt) * .7, shape: 0 });
    }
  }
  for (let i = 0; i < 8; i++) {
    const r = (k) => rnd(i, 99, k), w = (2 * Math.PI * (1 + Math.floor(r(1) * 2))) / total;
    out.push({ key: 'a' + i, x: 800 + (r(2) - .5) * 1200 + Math.sin(T * w + r(3) * 6) * 16, y: RY + (r(4) - .5) * 260 + Math.cos(T * w + r(5) * 6) * 10,
      sz: 2, o: .08 + .14 * (.5 + .5 * Math.sin(T * w * 2 + r(6) * 6)), shape: i % 3 === 0 ? 1 : 0 });
  }
  return out.map((p) => (
    <div key={p.key} style={{
      position: 'absolute', left: p.x, top: p.y, width: p.shape === 2 ? 1.5 : p.sz, height: p.shape === 2 ? 7 : p.sz,
      background: 'rgba(214,208,255,.9)', opacity: p.o, borderRadius: p.shape === 0 && p.sz <= 2 ? 1 : 0,
      transform: `translate(-50%,-50%) rotate(${p.shape === 1 ? 45 + (p.rot || 0) : p.rot || 0}deg)`,
    }} />
  ));
}

// Fill grows one notch per step, then drains off the left edge in the last step.
function Progress({ st, T, total }) {
  const { j, u, stepEnd, shiftE } = st, last = STEP_NAMES.length - 1;
  const b = 0.12 * (j + shiftE);
  const a = j === last ? b * MOTION.enter(cl((u - .75) / Math.max(.1, stepEnd - .75))) : 0;
  const N = 12, dots = Math.floor((T / total) * 28) % 4;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 3, width: 288 }}>
        {Array.from({ length: N }, (_, i) => {
          const lo = cl(a * N - i), hi = cl(b * N - i);
          return (
            <div key={i} style={{ flex: 1, height: 7, borderRadius: 1, background: 'rgba(255,255,255,.05)', border: `1px solid ${C.line}`, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${lo * 100}%`, width: `${Math.max(0, hi - lo) * 100}%`, background: C.accent, opacity: .85 }} />
            </div>);
        })}
      </div>
      <div style={{ fontFamily: C.mono, fontSize: 15, letterSpacing: '.18em', color: C.text3, textTransform: 'uppercase' }}>
        Building interface<span style={{ display: 'inline-block', width: 30, textAlign: 'left' }}>{'.'.repeat(dots)}</span>
      </div>
    </div>
  );
}

function Piece({ headline, message, particles }) {
  const { T: rawT, CUES: Q, authoredTotal: total } = useComposition();
  const starts = STEP_NAMES.map((n) => Q[n]);
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = reduce ? starts[0] + 1.6 : rawT;
  const st = rowState(T, starts, total);
  return (
    <div data-screen-label={`t=${Math.floor(rawT)}s`} style={{ position: 'absolute', inset: 0, width: W, height: H, background: C.ground, overflow: 'hidden', fontFamily: C.ui }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: C.stars, opacity: .3, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <h1 style={{ margin: 0, fontSize: 46, fontWeight: 500, letterSpacing: '.16em', color: C.text, lineHeight: 1.1, paddingLeft: '.16em' }}>{headline}</h1>
        <p style={{ margin: 0, fontSize: 22, color: C.text3, lineHeight: 1.4 }}>{message}</p>
      </div>
      <Chevrons u={reduce ? 9 : st.u} />
      <Placeholders cards={st.cards} T={T} total={total} />
      {st.cards.map((c) => <Card key={c.id} c={c} />)}
      <Particles st={st} T={T} on={particles && !reduce} total={total} />
      <Progress st={st} T={T} total={total} />
    </div>
  );
}

function ConstructionHero() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} bg="#08080f" scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
        <Piece headline={t.headline} message={t.message} particles={t.particles} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Copy" />
        <TweakText label="Headline" value={t.headline} onChange={(v) => setTweak('headline', v)} />
        <TweakText label="Message" value={t.message} onChange={(v) => setTweak('message', v)} />
        <TweakSection label="Motion" />
        <TweakToggle label="Particles" value={t.particles} onChange={(v) => setTweak('particles', v)} />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}
window.ConstructionHero = ConstructionHero;
