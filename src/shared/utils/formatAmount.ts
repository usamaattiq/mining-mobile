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
    return `${whole}.${fraction}`;
  }
  if (wholeRaw === '') return '';
  if (/^0+$/.test(wholeRaw)) return '0';
  return wholeRaw.replace(/^0+/, '');
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

const THOUSAND = 1_000;
const TEN_LAC = 1_000_000;
const BILLION = 1_000_000_000;

/** 1,000+ as "1.5k", 10 lac+ as "1.5M", and 1 billion+ as "2B". */
function formatLargeAmount(amount: number): string | null {
  const absolute = Math.abs(amount);
  if (absolute < THOUSAND) return null;
  const scale = absolute >= BILLION ? BILLION : absolute >= TEN_LAC ? TEN_LAC : THOUSAND;
  const label = absolute >= BILLION ? 'B' : absolute >= TEN_LAC ? 'M' : 'k';
  const scaled = Number((absolute / scale).toFixed(2)).toString();
  return `${amount < 0 ? '-' : ''}${scaled}${label}`;
}

/** Adds thousands separators to a numeric string, preserving any decimal part (e.g. "12000.5" -> "12,000.5"). */
export function formatAmountWithCommas(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return trimmed;

  const [integerPart, ...rest] = trimmed.split('.');
  const sign = integerPart!.startsWith('-') ? '-' : '';
  const digits = sign ? integerPart!.slice(1) : integerPart!;
  if (!/^\d+$/.test(digits)) return trimmed;

  const numeric = Number(
    rest.length > 0 ? `${sign}${digits}.${rest.join('')}` : `${sign}${digits}`,
  );
  const large = Number.isFinite(numeric) ? formatLargeAmount(numeric) : null;
  if (large) return large;

  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return [sign + withCommas, ...rest].join('.');
}
