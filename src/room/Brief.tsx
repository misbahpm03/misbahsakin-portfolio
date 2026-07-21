import * as React from 'react';
import emailjs from '@emailjs/browser';
import { contactConfig, emailJsConfig } from '../config/contact';

/**
 * The brief form, as a dialog over the room.
 *
 * It used to be a separate page in the old template's visual language, so
 * "Send a brief" threw you out of the room and into a different-looking site
 * mid-conversion. Same EmailJS call, same recipient — this is a presentation
 * change, not a behaviour one.
 */

type Fields = { name: string; email: string; subject: string; message: string };
const EMPTY: Fields = { name: '', email: '', subject: '', message: '' };

function validate(f: Fields) {
  const e: Partial<Record<keyof Fields | '_submit', string>> = {};
  if (!f.name.trim()) e.name = 'Your name, so I know who I am replying to.';
  if (!f.email.trim()) e.email = 'An email address, or I cannot reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'That address looks off.';
  if (!f.message.trim()) e.message = 'A sentence or two about what you need.';
  return e;
}

export function Brief({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fields, setFields] = React.useState<Fields>(EMPTY);
  const [errors, setErrors] = React.useState<Partial<Record<string, string>>>({});
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const dialog = React.useRef<HTMLDivElement>(null);
  const firstField = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setSent(false);
    setErrors({});
    firstField.current?.focus({ preventScroll: true });
  }, [open]);

  // Escape closes, and Tab cycles inside the dialog while it is open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialog.current) return;
      const items = dialog.current.querySelectorAll<HTMLElement>(
        'input, textarea, button, a[href]',
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined, _submit: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(fields);
    if (Object.keys(found).length) {
      setErrors(found);
      dialog.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setSending(true);
    try {
      await emailjs.send(
        emailJsConfig.serviceId,
        emailJsConfig.templateId,
        {
          from_name: fields.name.trim(),
          from_email: fields.email.trim(),
          subject: fields.subject.trim() || '(No subject)',
          message: fields.message.trim(),
          to_email: contactConfig.formRecipientEmail,
        },
        emailJsConfig.publicKey,
      );
      setSent(true);
      setFields(EMPTY);
    } catch {
      setErrors({
        _submit: `That did not send. Email ${contactConfig.email} directly and it will reach me.`,
      });
    } finally {
      setSending(false);
    }
  }

  const field = (
    k: keyof Fields,
    label: string,
    hint: string,
    Tag: 'input' | 'textarea' = 'input',
    type = 'text',
  ) => (
    <label className="brief-field">
      <span className="brief-label">{label}</span>
      <Tag
        {...(Tag === 'input' ? { type, ref: k === 'name' ? firstField : undefined } : { rows: 5 })}
        value={fields[k]}
        onChange={set(k)}
        placeholder={hint}
        aria-invalid={errors[k] ? 'true' : undefined}
        aria-describedby={errors[k] ? `brief-${k}-error` : undefined}
        className="brief-input"
      />
      {errors[k] && (
        <span className="brief-error" id={`brief-${k}-error`}>
          {errors[k]}
        </span>
      )}
    </label>
  );

  return (
    <>
      <div
        className={`brief-scrim${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialog}
        className={`brief${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Send a brief"
        aria-hidden={!open}
      >
        <button
          className="room-close brief-close"
          onClick={onClose}
          aria-label="Close"
          tabIndex={open ? 0 : -1}
        >
          ✕
        </button>

        {sent ? (
          <div className="brief-in brief-done">
            <p className="room-eyebrow">Sent</p>
            <h2>That reached me</h2>
            <p className="room-lede">
              I usually reply within 24 to 48 hours. If it is urgent,{' '}
              <a href={`mailto:${contactConfig.email}`}>email me directly</a>.
            </p>
            <button className="brief-send" onClick={onClose}>
              Back to the room
            </button>
          </div>
        ) : (
          <form className="brief-in" onSubmit={submit} noValidate>
            <p className="room-eyebrow">The phone</p>
            <h2>Send a brief</h2>
            <p className="room-lede">
              What you are building, roughly when, and what you need from a product manager.
              A few lines is plenty.
            </p>

            {field('name', 'Name', 'Who is writing')}
            {field('email', 'Email', 'Where I should reply', 'input', 'email')}
            {field('subject', 'Subject', 'Optional')}
            {field('message', 'Brief', 'Goals, timeline, what is in your way', 'textarea')}

            {errors._submit && (
              <p className="brief-error brief-error-submit" role="alert">
                {errors._submit}
              </p>
            )}

            <button className="brief-send" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send it'}
            </button>
            <p className="brief-alt">
              Or just email <a href={`mailto:${contactConfig.email}`}>{contactConfig.email}</a>
            </p>
          </form>
        )}
      </div>
    </>
  );
}
