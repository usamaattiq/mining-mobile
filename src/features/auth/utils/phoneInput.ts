const MAX_PHONE_DIGITS = 15;

/**
 * Keeps only digits, strips a leading trunk "0" (e.g. "0300..." -> "300...",
 * since the country code already replaces it), and caps the length to the
 * selected country's local number length.
 */
export function sanitizePhoneDigits(text: string, maxLength = MAX_PHONE_DIGITS): string {
  const digitsOnly = text.replace(/[^0-9]/g, '').replace(/^0+/, '');
  return digitsOnly.slice(0, maxLength);
}

/** Groups digits as "300 1234567" for display, without touching the stored raw digits. */
export function formatPhoneDisplay(digits: string): string {
  if (!digits) return '';
  const a = digits.slice(0, 3);
  const b = digits.slice(3);
  return b.length > 0 ? `${a} ${b}` : a;
}

/** A "3XX XXXXXXX"-style placeholder matching the selected country's expected length. */
export function placeholderForDigitLength(phoneDigitLength: number): string {
  const mask = `3${'X'.repeat(Math.max(phoneDigitLength - 1, 0))}`;
  return formatPhoneDisplay(mask);
}
