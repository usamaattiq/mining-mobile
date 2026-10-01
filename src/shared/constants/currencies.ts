export type Currency = {
  code: string;
  symbol: string;
};

/** Currency shown for a signed-up user's country (matches src/shared/constants/countries.ts). */
const CURRENCY_BY_ISO2: Record<string, Currency> = {
  US: { code: 'USD', symbol: '$' },
  GB: { code: 'GBP', symbol: '£' },
  AE: { code: 'AED', symbol: 'د.إ' },
  SA: { code: 'SAR', symbol: 'ر.س' },
  IN: { code: 'INR', symbol: '₹' },
  AU: { code: 'AUD', symbol: 'A$' },
  BH: { code: 'BHD', symbol: '.د.ب' },
  CA: { code: 'CAD', symbol: 'C$' },
  CN: { code: 'CNY', symbol: '¥' },
  EG: { code: 'EGP', symbol: 'ج.م' },
  FR: { code: 'EUR', symbol: '€' },
  DE: { code: 'EUR', symbol: '€' },
  GH: { code: 'GHS', symbol: '₵' },
  ID: { code: 'IDR', symbol: 'Rp' },
  IQ: { code: 'IQD', symbol: 'ع.د' },
  IT: { code: 'EUR', symbol: '€' },
  JO: { code: 'JOD', symbol: 'د.ا' },
  KE: { code: 'KES', symbol: 'KSh' },
  KW: { code: 'KWD', symbol: 'د.ك' },
  LB: { code: 'LBP', symbol: 'ل.ل' },
  MY: { code: 'MYR', symbol: 'RM' },
  MA: { code: 'MAD', symbol: 'د.م.' },
  NG: { code: 'NGN', symbol: '₦' },
  OM: { code: 'OMR', symbol: 'ر.ع.' },
  PK: { code: 'PKR', symbol: '₨' },
  PH: { code: 'PHP', symbol: '₱' },
  QA: { code: 'QAR', symbol: 'ر.ق' },
  ZA: { code: 'ZAR', symbol: 'R' },
  ES: { code: 'EUR', symbol: '€' },
  SD: { code: 'SDG', symbol: 'ج.س.' },
  TZ: { code: 'TZS', symbol: 'TSh' },
  TR: { code: 'TRY', symbol: '₺' },
  UG: { code: 'UGX', symbol: 'USh' },
  YE: { code: 'YER', symbol: '﷼' },
};

const DEFAULT_CURRENCY: Currency = { code: 'USD', symbol: '$' };

export function currencyForCountry(iso2: string | null | undefined): Currency {
  if (!iso2) return DEFAULT_CURRENCY;
  return CURRENCY_BY_ISO2[iso2.trim().toUpperCase()] ?? DEFAULT_CURRENCY;
}
