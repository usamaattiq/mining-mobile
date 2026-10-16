/**
 * Gold weight: digits and one `.` only. The point is allowed only after 0–9
 * (".5" becomes "5"; a leading "." is dropped). Extra dots in the fraction are stripped.
 */
export function sanitizeGoldWeight(raw: string): string {
  const cleaned = raw.replace(/,/g, '.').replace(/[^\d.]/g, '');
  const firstDot = cleaned.indexOf('.');
  const wholeRaw = firstDot === -1 ? cleaned : cleaned.slice(0, firstDot);
  const fraction = firstDot === -1 ? null : cleaned.slice(firstDot + 1).replace(/\./g, '');
  const whole = wholeRaw.replace(/^0+(?=\d)/, '');
  if (whole === '') {
    return fraction ? fraction.replace(/^0+(?=\d)/, '') : '';
  }
  if (fraction != null) return `${whole}.${fraction}`;
  return whole;
}

/** Keeps a lone 0 so the field can show an error, and drops it once another digit is typed. */
export function sanitizeStepPrice(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  const wholeRaw = dot === -1 ? cleaned : cleaned.slice(0, dot);
  const fraction = dot === -1 ? null : cleaned.slice(dot + 1).replace(/\./g, '');
  if (fraction != null) {
    const whole = wholeRaw.replace(/^0+(?=\d)/, '') || '0';
    return `${formatAmountWithCommas(whole)}.${fraction}`;
  }
  if (wholeRaw === '') return '';
  if (/^0+$/.test(wholeRaw)) return '0';
  return formatAmountWithCommas(wholeRaw.replace(/^0+/, ''));
}

export function parsePositiveAmount(value: string | null | undefined): number | null {
  const n = Number(
    String(value ?? '')
      .replace(/,/g, '')
      .trim(),
  );
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatMoneyAmount(currencyCode: string, amount: number | string): string {
  return `${currencyCode} ${formatAmountWithCommas(typeof amount === 'number' ? String(amount) : amount)}`;
}

/** Adds thousands separators to a numeric string, preserving any decimal part (e.g. "12000.5" -> "12,000.5"). */
export function formatAmountWithCommas(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return trimmed;

  const [integerPart, ...rest] = trimmed.split('.');
  const sign = integerPart!.startsWith('-') ? '-' : '';
  const digits = sign ? integerPart!.slice(1) : integerPart!;
  if (!/^\d+$/.test(digits)) return trimmed;

  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return [sign + withCommas, ...rest].join('.');
}
