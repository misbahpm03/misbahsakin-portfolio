import * as React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Panel, Blocks } from './Panel';
import { Brief } from './Brief';
import { BY_SLUG, NAV_LABEL, PROFILE, SECTIONS, SECTION_ORDER, type SectionId } from './content';
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

/**
 * Every section as plain readable prose. One source, three uses: the no-WebGL
 * fallback, what gets pre-rendered into the HTML for crawlers and link
 * previews, and what fills the screen while the 3D chunk downloads — so a slow
 * connection gets the CV to read instead of the word "loading".
 */
export function SeoBody({ plain = false }: { plain?: boolean }) {
  return (
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
          <Blocks blocks={SECTIONS[id].blocks} plain={plain} />
        </section>
      ))}
    </div>
  );
}

/**
 * What you see while the 3D chunk downloads. Deliberately the room's own
 * background and header rather than the flat CV: showing a whole different
 * page for a moment and then replacing it is what read as a glitch on reload.
 */
function RoomLoading() {
  return (
    <div className="room-boot" aria-live="polite">
      <span className="room-boot-lamp" />
      <span className="room-boot-text">Lighting the room</span>
    </div>
  );
}

/** Same content, no canvas: readable on anything, and what crawlers get. */
export function FlatFallback({ plain = false }: { plain?: boolean }) {
  return (
    <div className="room-root">
      <div className="room-fallback">
        <SeoBody plain={plain} />
      </div>
    </div>
  );
}

export default function RoomPortfolio() {
  // The URL is the source of truth for which section is open. Keeping it in
  // component state as well would mean two things to hold in sync, and the
  // browser Back button would drift out of step with the drawer.
  const { section: slug } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active: SectionId | null = (slug && BY_SLUG[slug]) || null;

  const [touched, setTouched] = React.useState(false);
  // /message is a real URL that opens the dialog, so the form stays linkable.
  const [briefOpen, setBriefOpen] = React.useState(pathname === '/message');
  const reducedMotion = usePrefersReducedMotion();
  const [webgl, setWebgl] = React.useState<boolean | null>(null);
  const lastTrigger = React.useRef<HTMLElement | null>(null);
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setWebgl(hasWebGL()), []);

  // /nonsense should land in the room, not on a blank URL that means nothing.
  React.useEffect(() => {
    if (slug && !BY_SLUG[slug]) navigate('/', { replace: true });
  }, [slug, navigate]);

  React.useEffect(() => {
    if (pathname === '/message') setBriefOpen(true);
  }, [pathname]);

  const closeBrief = React.useCallback(() => {
    setBriefOpen(false);
    // Arriving straight at /message leaves nowhere to go back to, so put the
    // visitor in the contact drawer rather than on a URL still naming a form
    // that is no longer open.
    if (pathname === '/message') navigate('/contact', { replace: true });
  }, [pathname, navigate]);

  // Each section is its own page as far as a browser tab or a shared link is
  // concerned, so the title has to follow.
  React.useEffect(() => {
    document.title = active
      ? `${SECTIONS[active].title} — ${PROFILE.name}`
      : `${PROFILE.name} — ${PROFILE.role}`;
  }, [active]);

  // `active` decides what the drawer holds and where the camera flies; `shown`
  // drives the slide. Splitting them lets the panel's DOM — up to 40 chips for
  // Skills — be built in one frame and animated from the next, instead of the
  // insert stalling the first frame of the transition.
  const [shown, setShown] = React.useState(false);

  const open = React.useCallback(
    (id: SectionId) => {
      setTouched(true);
      navigate('/' + SECTIONS[id].slug);
    },
    [navigate],
  );

  React.useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const close = React.useCallback(() => {
    navigate('/');
    // Never leave focus inside the closed drawer: it is aria-hidden, and a
    // stranded focus swallows the arrow keys that walk the room.
    (lastTrigger.current ?? root.current)?.focus();
    lastTrigger.current = null;
  }, [navigate]);

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

  // null = still probing, so hold the room's background rather than swapping
  // in a different-looking page for a frame. false = no WebGL, show the CV.
  if (webgl === null) return <div className="room-root"><RoomLoading /></div>;
  if (!webgl) return <FlatFallback />;

  return (
    <div className="room-root" ref={root} tabIndex={-1}>
      <div className="room-canvas">
        <React.Suspense fallback={<RoomLoading />}>
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
      <Panel
        section={active ? SECTIONS[active] : null}
        open={shown}
        onClose={close}
        onBrief={() => setBriefOpen(true)}
      />
      <Brief open={briefOpen} onClose={closeBrief} />
    </div>
  );
}
