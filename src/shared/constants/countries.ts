export type Country = {
  iso2: string;
  name: string;
  dialCode: string;
  flag: string;
  /** Number of digits in the local (post-country-code) phone number. */
  phoneDigitLength: number;
};

/** Priority markets shown first, in this order. */
const PRIORITY_ISO2 = ['PK', 'US', 'GB', 'AE', 'SA', 'IN'];

const ALL_COUNTRIES: Country[] = [
  { iso2: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', phoneDigitLength: 10 },
  { iso2: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', phoneDigitLength: 10 },
  { iso2: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', phoneDigitLength: 9 },
  { iso2: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', phoneDigitLength: 9 },
  { iso2: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', phoneDigitLength: 10 },
  { iso2: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', phoneDigitLength: 9 },
  { iso2: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', phoneDigitLength: 8 },
  { iso2: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', phoneDigitLength: 10 },
  { iso2: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', phoneDigitLength: 11 },
  { iso2: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', phoneDigitLength: 10 },
  { iso2: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', phoneDigitLength: 9 },
  { iso2: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', phoneDigitLength: 10 },
  { iso2: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', phoneDigitLength: 9 },
  { iso2: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', phoneDigitLength: 10 },
  { iso2: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶', phoneDigitLength: 10 },
  { iso2: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', phoneDigitLength: 10 },
  { iso2: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴', phoneDigitLength: 9 },
  { iso2: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', phoneDigitLength: 9 },
  { iso2: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', phoneDigitLength: 8 },
  { iso2: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧', phoneDigitLength: 8 },
  { iso2: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', phoneDigitLength: 9 },
  { iso2: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦', phoneDigitLength: 9 },
  { iso2: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', phoneDigitLength: 10 },
  { iso2: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', phoneDigitLength: 8 },
  { iso2: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', phoneDigitLength: 10 },
  { iso2: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', phoneDigitLength: 10 },
  { iso2: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', phoneDigitLength: 8 },
  { iso2: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', phoneDigitLength: 9 },
  { iso2: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', phoneDigitLength: 9 },
  { iso2: 'SD', name: 'Sudan', dialCode: '+249', flag: '🇸🇩', phoneDigitLength: 9 },
  { iso2: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿', phoneDigitLength: 9 },
  { iso2: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', phoneDigitLength: 10 },
  { iso2: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬', phoneDigitLength: 9 },
  { iso2: 'YE', name: 'Yemen', dialCode: '+967', flag: '🇾🇪', phoneDigitLength: 9 },
];

const priorityRank = new Map(PRIORITY_ISO2.map((iso2, index) => [iso2, index]));

export const countries: Country[] = [...ALL_COUNTRIES].sort((a, b) => {
  const rankA = priorityRank.get(a.iso2);
  const rankB = priorityRank.get(b.iso2);

  if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
  if (rankA !== undefined) return -1;
  if (rankB !== undefined) return 1;
  return a.name.localeCompare(b.name);
});

export const defaultCountry: Country = countries[0] as Country;

export function countryByIso2(iso2: string): Country | undefined {
  const key = iso2.trim().toUpperCase();
  return countries.find((country) => country.iso2 === key);
}
