import * as React from 'react';
import { Panel, Blocks } from './Panel';
import { NAV_LABEL, PROFILE, SECTIONS, SECTION_ORDER, type SectionId } from './content';
import './room.css';

const Room = React.lazy(() => import('./Room').then((m) => ({ default: m.Room })));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return reduced;
}

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/** Same content, no canvas: readable on anything, and what crawlers get. */
function FlatFallback() {
  return (
    <div className="room-root">
      <div className="room-fallback">
        <div className="room-fallback-in">
          <header className="room-header" style={{ position: 'static', padding: 0 }}>
            <h1>{PROFILE.name}</h1>
            <p>
              {PROFILE.role} · {PROFILE.place}
            </p>
          </header>
          {SECTION_ORDER.map((id) => (
            <section key={id}>
              <h2>{SECTIONS[id].title}</h2>
              <p className="room-eyebrow" style={{ color: '#9aa8b0' }}>
                {SECTIONS[id].object}
              </p>
              <Blocks blocks={SECTIONS[id].blocks} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoomPortfolio() {
  const [active, setActive] = React.useState<SectionId | null>(null);
  const [touched, setTouched] = React.useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const [webgl, setWebgl] = React.useState<boolean | null>(null);
  const lastTrigger = React.useRef<HTMLElement | null>(null);
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setWebgl(hasWebGL()), []);

  // `active` decides what the drawer holds and where the camera flies; `shown`
  // drives the slide. Splitting them lets the panel's DOM — up to 40 chips for
  // Skills — be built in one frame and animated from the next, instead of the
  // insert stalling the first frame of the transition.
  const [shown, setShown] = React.useState(false);

  const open = React.useCallback((id: SectionId) => {
    setActive(id);
    setTouched(true);
  }, []);

  React.useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const close = React.useCallback(() => {
    setActive(null);
    // Never leave focus inside the closed drawer: it is aria-hidden, and a
    // stranded focus swallows the arrow keys that walk the room.
    (lastTrigger.current ?? root.current)?.focus();
    lastTrigger.current = null;
  }, []);

  // Arrow keys walk the room; Escape leaves whatever you are looking at.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      // Only text entry needs left/right; the open drawer does not, so arrows
      // keep walking the room while you read it.
      const target = e.target as HTMLElement;
      if (target?.closest('input, textarea, select, [contenteditable]')) return;
      e.preventDefault();
      const at = active ? SECTION_ORDER.indexOf(active) : -1;
      const step = e.key === 'ArrowRight' ? 1 : -1;
      const next = (at + step + SECTION_ORDER.length) % SECTION_ORDER.length;
      open(SECTION_ORDER[next]);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, open]);

  if (webgl === null) return <div className="room-root" />;
  if (!webgl) return <FlatFallback />;

  return (
    <div className="room-root" ref={root} tabIndex={-1}>
      <div className="room-canvas">
        <React.Suspense fallback={<div className="room-loading">Drawing the room…</div>}>
          <Room
            active={active}
            onOpen={open}
            onDismiss={close}
            reducedMotion={reducedMotion}
          />
        </React.Suspense>
      </div>

      <header className="room-header">
        <h1>{PROFILE.name}</h1>
        <p>
          {PROFILE.role} · Dhaka
        </p>
      </header>

      <p className={`room-cue${touched ? ' is-hidden' : ''}`}>
        Drag to look around · click an object or its name
      </p>

      {active && (
        <button className="room-reset" onClick={close}>
          Step back
        </button>
      )}

      <nav className="room-nav" aria-label="Sections">
        {SECTION_ORDER.map((id) => (
          <button
            key={id}
            className={active === id ? 'is-active' : undefined}
            onClick={(e) => {
              lastTrigger.current = e.currentTarget;
              open(id);
            }}
          >
            {NAV_LABEL[id]}
          </button>
        ))}
      </nav>

      <div
        className={`room-scrim${shown ? ' is-open' : ''}`}
        onClick={close}
        aria-hidden="true"
      />
      <Panel section={active ? SECTIONS[active] : null} open={shown} onClose={close} />
    </div>
  );
}
