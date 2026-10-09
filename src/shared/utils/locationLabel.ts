export type LocationLabelParts = {
  /** Freely editable portion (street, building, area, etc). */
  addressLine: string;
  /** Second-to-last comma segment — locked once a location is picked. */
  city: string;
  /** Last comma segment — locked once a location is picked. */
  country: string;
};

/**
 * Geocoded labels are comma-separated with city/country as the last two
 * segments (see resolveAddressLabel). Splitting them lets the address line
 * stay editable while city/country stay pinned until a new location is picked.
 */
export function splitLocationLabel(label: string): LocationLabelParts {
  const parts = label
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return { addressLine: '', city: '', country: '' };
  if (parts.length === 1) return { addressLine: '', city: '', country: parts[0]! };
  if (parts.length === 2) return { addressLine: '', city: parts[0]!, country: parts[1]! };

  const country = parts[parts.length - 1]!;
  const city = parts[parts.length - 2]!;
  const addressLine = parts.slice(0, parts.length - 2).join(', ');
  return { addressLine, city, country };
}

export function combineLocationLabel(addressLine: string, city: string, country: string): string {
  return [addressLine.trim(), city, country].filter(Boolean).join(', ');
}

const POSTAL_CODE = /^(?:[A-Z]{1,2})?\d[\d\s-]{2,}$/i;
const REGION_OR_STATE =
  /\b(region|province|governorate|state|county|emirate|municipality)\b|منطقة|محافظة|إمارة|ولاية/i;

/** Admin-1 names that appear without "Province"/"Region" in the label (e.g. Lahore, Punjab, Pakistan). */
const ADMIN1_NAMES = new Set(
  [
    'punjab',
    'sindh',
    'balochistan',
    'baluchistan',
    'khyber pakhtunkhwa',
    'kpk',
    'islamabad',
    'islamabad capital territory',
    'gilgit-baltistan',
    'azad kashmir',
    'azad jammu and kashmir',
    'makkah',
    'medina',
    'madinah',
    'asir',
    'tabuk',
    'hail',
    'jizan',
    'najran',
    'al bahah',
    'al jawf',
  ].map((name) => name.toLowerCase()),
);

function isPostalCode(part: string): boolean {
  const compact = part.replace(/\s/g, '');
  return POSTAL_CODE.test(part) || /^\d{4,}$/.test(compact);
}

function isRegionOrState(part: string): boolean {
  return REGION_OR_STATE.test(part) || ADMIN1_NAMES.has(part.toLowerCase());
}

/**
 * City for filters and matching. Geocoded labels often end with
 * `city, region/state, postal, country` — the second-to-last segment is the
 * state, not the city.
 */
export function cityFromLocationLabel(label: string): string {
  const parts = label
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0] ?? '';

  const candidates = parts.slice(0, -1);
  while (candidates.length > 1 && isPostalCode(candidates[candidates.length - 1] ?? '')) {
    candidates.pop();
  }
  while (candidates.length > 1 && isRegionOrState(candidates[candidates.length - 1] ?? '')) {
    candidates.pop();
  }

  return candidates[candidates.length - 1] ?? '';
}
