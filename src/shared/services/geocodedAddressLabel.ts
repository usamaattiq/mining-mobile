import * as Location from 'expo-location';

function dedupeJoin(parts: Array<string | null | undefined>): string {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    const trimmed = part?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result.join(', ');
}

/** On-device reverse geocoding — no network/API key required. */
export async function resolveAddressLabel(latitude: number, longitude: number): Promise<string> {
  const results = await Location.reverseGeocodeAsync({ latitude, longitude });
  const first = results[0];

  if (!first) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  const streetLine = dedupeJoin([
    [first.streetNumber, first.street].filter(Boolean).join(' ') || first.name,
    first.district,
  ]);
  const city = first.city?.trim() || first.subregion?.trim() || '';
  const label = dedupeJoin([streetLine, city, first.country]);

  return label || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
