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

const TEN_LAC = 1_000_000;
const BILLION = 1_000_000_000;

/** 10 lac and above as "1.5M" or "2B". Smaller amounts keep comma grouping. */
function formatLargeAmount(amount: number): string | null {
  const absolute = Math.abs(amount);
  if (absolute < TEN_LAC) return null;
  const scale = absolute >= BILLION ? BILLION : TEN_LAC;
  const label = absolute >= BILLION ? 'B' : 'M';
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

  const numeric = Number(rest.length > 0 ? `${sign}${digits}.${rest.join('')}` : `${sign}${digits}`);
  const large = Number.isFinite(numeric) ? formatLargeAmount(numeric) : null;
  if (large) return large;

  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return [sign + withCommas, ...rest].join('.');
}
