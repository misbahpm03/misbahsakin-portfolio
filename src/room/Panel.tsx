import * as React from 'react';
import { Link } from 'react-router-dom';
import type { Block, Section } from './content';

/**
 * Renders one content block. Shared by the drawer, the no-WebGL fallback and
 * the build-time pre-render.
 *
 * `plain` swaps react-router <Link> for a bare <a>. The pre-render has no
 * router, and giving it a MemoryRouter just to satisfy Link produced a
 * useLayoutEffect-on-the-server warning for markup that is never hydrated.
 * A full page load is the right behaviour there anyway.
 */
export function Blocks({
  blocks,
  plain = false,
  onBrief,
}: {
  blocks: Block[];
  plain?: boolean;
  /** absent in the pre-render and the no-JS fallback, where a link is right */
  onBrief?: () => void;
}) {
  const stats = blocks.filter((b): b is Extract<Block, { kind: 'stat' }> => b.kind === 'stat');
  const rest = blocks.filter((b) => b.kind !== 'stat');

  return (
    <>
      {rest.map((b, i) => {
        if (b.kind === 'lede') return <p className="room-lede" key={i}>{b.text}</p>;

        if (b.kind === 'tags')
          return (
            <div className="room-entry" key={i}>
              <h3>{b.title}</h3>
              <div className="room-chips">
                {b.tags.map((t) => (
                  <span className="room-chip" key={t}>{t}</span>
                ))}
              </div>
            </div>
          );

        if (b.kind === 'brief') {
          // With no handler (pre-render, no-WebGL page) fall back to the route,
          // so the form is still reachable without JavaScript.
          if (!onBrief)
            return (
              <a className="room-reach" href="/message" key={i}>
                {b.value}
                <small>{b.label}</small>
              </a>
            );
          return (
            <button className="room-reach" onClick={onBrief} key={i}>
              {b.value}
              <small>{b.label}</small>
            </button>
          );
        }

        if (b.kind === 'link') {
          const internal = b.href.startsWith('/');
          const inner = (
            <>
              {b.value}
              <small>{b.label}</small>
            </>
          );
          return internal && !plain ? (
            <Link className="room-reach" to={b.href} key={i}>{inner}</Link>
          ) : (
            <a
              className="room-reach"
              href={b.href}
              key={i}
              target={b.href.startsWith('http') ? '_blank' : undefined}
              rel={b.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {inner}
            </a>
          );
        }

        return (
          <div className="room-entry" key={i}>
            <h3>{b.title}</h3>
            {b.when && <p className="room-when">{b.when}</p>}
            {b.body && <p>{b.body}</p>}
            {b.bullets && (
              <ul>
                {b.bullets.map((x, j) => (
                  <li key={j}>{x}</li>
                ))}
              </ul>
            )}
            {b.tags && (
              <div className="room-chips">
                {b.tags.map((t) => (
                  <span className="room-chip" key={t}>{t}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {stats.length > 0 && (
        <div className="room-stats">
          {stats.map((s, i) => (
            <div className="room-stat" key={i}>
              <b>{s.value}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function Panel({
  section,
  open,
  onClose,
  onBrief,
}: {
  section: Section | null;
  open: boolean;
  onClose: () => void;
  onBrief?: () => void;
}) {
  const sheet = React.useRef<HTMLElement>(null);
  const closeBtn = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    sheet.current?.scrollTo(0, 0);
    // preventScroll matters: focusing an element inside a panel that is still
    // translated off-screen makes the browser scroll it into view, which jolts
    // mid-slide.
    closeBtn.current?.focus({ preventScroll: true });
  }, [open, section?.id]);

  // Escape closes, and focus stays inside the drawer while it is open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !sheet.current) return;
      const focusable = sheet.current.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <aside
      ref={sheet}
      className={`room-sheet${open ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={section?.title ?? 'Section'}
      aria-hidden={!open}
    >
      <button
        ref={closeBtn}
        className="room-close"
        onClick={onClose}
        aria-label="Close"
        tabIndex={open ? 0 : -1}
      >
        ✕
      </button>
      {section && (
        <div className="room-sheet-in">
          <p className="room-eyebrow">{section.object}</p>
          <h2>{section.title}</h2>
          <Blocks blocks={section.blocks} onBrief={onBrief} />
        </div>
      )}
    </aside>
  );
}
