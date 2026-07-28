import { useRef, useState, type FormEvent } from 'react';
import {
  validateEnquiry,
  isValid,
  MESSAGE_MAX,
  type EnquiryErrors,
  type EnquiryInput,
} from '../lib/enquiry';

interface Props {
  endpoint: string;
  segments: readonly string[];
  scales: readonly string[];
  timelines: readonly string[];
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMPTY: EnquiryInput = {
  name: '',
  email: '',
  phone: '',
  organisation: '',
  segment: '',
  city: '',
  scale: '',
  timeline: '',
  message: '',
};

const field =
  'w-full rounded-lg border border-border bg-forest-deep/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none';
const label = 'block text-sm font-medium text-foreground';

export default function ContactForm({ endpoint, segments, scales, timelines }: Props) {
  const [values, setValues] = useState<EnquiryInput>(EMPTY);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');

  // Bots fill hidden fields and submit instantly; both are checked server-side too.
  const honeypot = useRef<HTMLInputElement>(null);
  const openedAt = useRef(Date.now());

  const set = (key: keyof EnquiryInput) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    const found = validateEnquiry(values);
    setErrors(found);
    if (!isValid(found)) {
      // Move focus to the first problem so keyboard and screen-reader users land on it.
      const firstKey = Object.keys(found)[0];
      document.getElementById(`f-${firstKey}`)?.focus();
      return;
    }

    setStatus('sending');
    try {
      const body = new FormData();
      Object.entries(values).forEach(([k, v]) => body.append(k, v));
      body.append('company_website', honeypot.current?.value ?? '');
      body.append('elapsed', String(Date.now() - openedAt.current));

      const res = await fetch(endpoint, { method: 'POST', body });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('sent');
      setValues(EMPTY);
    } catch (err) {
      setStatus('error');
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (status === 'sent') {
    return (
      <div
        className="glass rounded-[var(--radius)] p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/15">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m5 13 4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-semibold">Thank you — your enquiry is in.</h2>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          We read every enquiry ourselves and normally reply within one working day. If it is
          urgent, call us directly.
        </p>
        <button type="button" className="btn btn-outline mt-6" onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="glass rounded-[var(--radius)] p-6 md:p-8">
      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="company_website">Do not fill this in</label>
        <input
          id="company_website"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          ref={honeypot}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Your name"
          required
          value={values.name}
          onChange={set('name')}
          error={errors.name}
          autoComplete="name"
        />
        <Field
          id="organisation"
          label="Organisation"
          value={values.organisation}
          onChange={set('organisation')}
          autoComplete="organization"
        />
        <Field
          id="email"
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
        />
        <Field
          id="phone"
          label="Phone"
          type="tel"
          value={values.phone}
          onChange={set('phone')}
          error={errors.phone}
          autoComplete="tel"
          placeholder="+91"
        />
        <Select
          id="segment"
          label="Which best describes you?"
          required
          value={values.segment}
          onChange={set('segment')}
          error={errors.segment}
          options={segments}
        />
        <Field
          id="city"
          label="City / site location"
          value={values.city}
          onChange={set('city')}
          autoComplete="address-level2"
        />
        <Select
          id="scale"
          label="System of interest"
          value={values.scale}
          onChange={set('scale')}
          options={scales}
        />
        <Select
          id="timeline"
          label="Timeline"
          value={values.timeline}
          onChange={set('timeline')}
          options={timelines}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="f-message" className={label}>
          Tell us about your requirement <span className="text-primary">*</span>
        </label>
        <textarea
          id="f-message"
          name="message"
          rows={5}
          required
          maxLength={MESSAGE_MAX}
          className={`${field} mt-2 resize-y`}
          value={values.message}
          onChange={(e) => set('message')(e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'e-message' : undefined}
          placeholder="Site type, approximate area, what you are trying to achieve, and any deadline you are working to."
        />
        {errors.message && (
          <p id="e-message" className="mt-1.5 text-sm text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      {serverError && (
        <p
          className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary mt-6 w-full sm:w-auto"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Sending…' : 'Send Enquiry'}
      </button>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        We use your details only to respond to this enquiry. No newsletters, no third-party sharing.
      </p>
    </form>
  );
}

/* ── Small field primitives, local to this form ─────────────────────────── */

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
}

function Field({
  id,
  label: text,
  value,
  onChange,
  type = 'text',
  required,
  error,
  autoComplete,
  placeholder,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className={label}>
        {text} {required && <span className="text-primary">*</span>}
      </label>
      <input
        id={`f-${id}`}
        name={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `e-${id}` : undefined}
        className={`${field} mt-2`}
      />
      {error && (
        <p id={`e-${id}`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  required?: boolean;
  error?: string;
}

function Select({ id, label: text, value, onChange, options, required, error }: SelectProps) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className={label}>
        {text} {required && <span className="text-primary">*</span>}
      </label>
      <select
        id={`f-${id}`}
        name={id}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `e-${id}` : undefined}
        className={`${field} mt-2`}
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <p id={`e-${id}`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
