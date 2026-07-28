/**
 * Enquiry validation shared by the browser form and mirrored by contact.php.
 *
 * Keep the rules here in sync with public/contact.php — the server is the
 * authority, this copy exists only to give the user immediate feedback.
 */

export interface EnquiryInput {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  segment: string;
  city: string;
  scale: string;
  timeline: string;
  message: string;
}

export type EnquiryErrors = Partial<Record<keyof EnquiryInput, string>>;

/**
 * Deliberately permissive. A stricter regex rejects valid addresses far more
 * often than it catches typos, and the real bounce test is the reply.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts +91 98202 17090, 09820217090, 9820217090 and similar. */
const PHONE = /^[+\d][\d\s\-()]{7,19}$/;

export const MESSAGE_MAX = 2000;

export function validateEnquiry(input: Partial<EnquiryInput>): EnquiryErrors {
  const errors: EnquiryErrors = {};
  const trim = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

  if (trim(input.name).length < 2) {
    errors.name = 'Please enter your name.';
  }

  const email = trim(input.email);
  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL.test(email)) {
    errors.email = 'That email address does not look right.';
  }

  const phone = trim(input.phone);
  if (phone && !PHONE.test(phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (!trim(input.segment)) {
    errors.segment = 'Please choose the option that best describes you.';
  }

  if (trim(input.message).length < 10) {
    errors.message = 'Please tell us a little about your requirement.';
  } else if (trim(input.message).length > MESSAGE_MAX) {
    errors.message = `Please keep this under ${MESSAGE_MAX} characters.`;
  }

  return errors;
}

export const isValid = (errors: EnquiryErrors) => Object.keys(errors).length === 0;
