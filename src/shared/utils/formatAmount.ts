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
