/**
 * Normalize a user-entered email before validation, lookup, or storage.
 * The DB column is citext (case-insensitive) but the app still trims and
 * lowercases so two users can't register visually-identical emails that
 * differ only in incidental whitespace.
 */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A syntactically plausible email address. */
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/** Minimum viable password policy: at least 8 characters. */
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}
