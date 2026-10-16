export type MapSearchResult = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

type PlacesTextSearchApiResponse = {
  status: string;
  results?: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
};

/**
 * Client-side Places search (bt-app style).
 * Uses Places API Text Search, which matches place names/keywords in addition to
 * addresses — the Geocoding API this used to call only resolves structured
 * addresses, so searching for a business/landmark/informal name returned nothing.
 * Requires the "Places API" enabled on the mobile Maps key.
 */
export async function searchMapLocations(
  query: string,
  apiKey: string,
  language?: string,
): Promise<MapSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || !apiKey) return [];

  const url =
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(trimmed)}` +
    `&key=${encodeURIComponent(apiKey)}` +
    (language ? `&language=${encodeURIComponent(language)}` : '');

  const response = await fetch(url);
  if (!response.ok) return [];

  const payload = (await response.json()) as PlacesTextSearchApiResponse;
  if (payload.status !== 'OK' || !payload.results?.length) return [];

  return payload.results.slice(0, 5).map((result) => ({
    id: result.place_id,
    label: result.formatted_address || result.name,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
  }));
}

export type CitySearchResult = {
  id: string;
  label: string;
};

type PlacesAutocompleteApiResponse = {
  status: string;
  predictions?: Array<{
    place_id: string;
    description: string;
    types?: string[];
  }>;
};

function isCityOrArea(types: string[] | undefined): boolean {
  if (!types?.length) return false;
  if (types.includes('country')) return false;
  const area = types.some(
    (type) =>
      type === 'locality' ||
      type === 'neighborhood' ||
      type.startsWith('sublocality') ||
      type === 'administrative_area_level_3',
  );
  if (!area) return false;
  if (
    types.includes('administrative_area_level_1') &&
    !types.includes('locality') &&
    !types.includes('neighborhood') &&
    !types.some((type) => type.startsWith('sublocality'))
  ) {
    return false;
  }
  return true;
}

/** Places Autocomplete restricted to cities, same approach as Stride. */
export async function searchCities(
  query: string,
  apiKey: string,
  language?: string,
): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || !apiKey) return [];

  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(trimmed)}` +
    `&types=${encodeURIComponent('(cities)')}` +
    `&key=${encodeURIComponent(apiKey)}` +
    (language ? `&language=${encodeURIComponent(language)}` : '');

  const response = await fetch(url);
  if (!response.ok) return [];

  const payload = (await response.json()) as PlacesAutocompleteApiResponse;
  if (payload.status !== 'OK' || !payload.predictions?.length) return [];

  return payload.predictions.slice(0, 8).map((item) => ({
    id: item.place_id,
    label: item.description,
  }));
}

async function autocompletePlaces(
  query: string,
  apiKey: string,
  language: string | undefined,
  types?: string,
): Promise<NonNullable<PlacesAutocompleteApiResponse['predictions']>> {
  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}` +
    (types ? `&types=${encodeURIComponent(types)}` : '') +
    `&key=${encodeURIComponent(apiKey)}` +
    (language ? `&language=${encodeURIComponent(language)}` : '');
  const response = await fetch(url);
  if (!response.ok) return [];
  const payload = (await response.json()) as PlacesAutocompleteApiResponse;
  if (payload.status !== 'OK' || !payload.predictions?.length) return [];
  return payload.predictions;
}

/** Cities plus areas inside them, such as Gulberg or Faisal Town in Lahore. */
export async function searchServiceAreas(
  query: string,
  apiKey: string,
  language?: string,
): Promise<CitySearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed || !apiKey) return [];

  const [regions, areas] = await Promise.all([
    autocompletePlaces(trimmed, apiKey, language, '(regions)'),
    autocompletePlaces(trimmed, apiKey, language),
  ]);
  const seen = new Set<string>();
  const places: CitySearchResult[] = [];
  for (const item of [...regions, ...areas]) {
    if (!isCityOrArea(item.types) || seen.has(item.place_id)) continue;
    seen.add(item.place_id);
    places.push({ id: item.place_id, label: item.description });
    if (places.length >= 8) break;
  }
  return places;
}

export type ServiceAreaPlace = {
  id: string;
  label: string;
  /** Area or city name only, without the parent city or country. */
  name: string;
  kind: 'city' | 'town';
  /** City this town sits in. Empty for cities. */
  parentCity: string;
};

type PlaceDetailsApiResponse = {
  status: string;
  result?: {
    name?: string;
    types?: string[];
    address_components?: Array<{ long_name: string; types: string[] }>;
  };
};

function addressName(
  components: Array<{ long_name: string; types: string[] }> | undefined,
  type: string,
): string {
  return components?.find((item) => item.types.includes(type))?.long_name?.trim() ?? '';
}

function samePlaceName(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

/** Cities and towns. A town records the city it belongs to. */
export async function resolveServiceAreaPlace(
  place: CitySearchResult,
  apiKey: string,
  language?: string,
): Promise<ServiceAreaPlace> {
  const fallbackName = place.label.split(',')[0]?.trim() || place.label;
  const fallback: ServiceAreaPlace = {
    id: place.id,
    label: place.label,
    name: fallbackName,
    kind: 'city',
    parentCity: '',
  };
  if (!apiKey) return fallback;

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place.id)}` +
    `&fields=${encodeURIComponent('name,types,address_components')}` +
    `&key=${encodeURIComponent(apiKey)}` +
    (language ? `&language=${encodeURIComponent(language)}` : '');

  const response = await fetch(url);
  if (!response.ok) return fallback;
  const payload = (await response.json()) as PlaceDetailsApiResponse;
  if (payload.status !== 'OK' || !payload.result) return fallback;

  const name = payload.result.name?.trim() || place.label.split(',')[0]?.trim() || place.label;
  const components = payload.result.address_components;
  const locality = addressName(components, 'locality');
  const admin2 = addressName(components, 'administrative_area_level_2');
  const sublocality =
    addressName(components, 'sublocality') ||
    addressName(components, 'sublocality_level_1') ||
    addressName(components, 'administrative_area_level_3');
  const types = payload.result.types ?? [];
  const neighborhood = addressName(components, 'neighborhood');
  const parentCity =
    (locality && !samePlaceName(locality, name) ? locality : '') ||
    (admin2 && !samePlaceName(admin2, name) && !samePlaceName(admin2, locality) ? admin2 : '');
  const isTown =
    types.some((type) => type.startsWith('sublocality') || type === 'neighborhood') ||
    Boolean(sublocality && samePlaceName(sublocality, name)) ||
    Boolean(neighborhood && samePlaceName(neighborhood, name)) ||
    Boolean(parentCity && !types.includes('locality'));

  return {
    id: place.id,
    label: place.label,
    name,
    kind: isTown && parentCity ? 'town' : 'city',
    parentCity: isTown && parentCity && !samePlaceName(parentCity, name) ? parentCity : '',
  };
}

export function serviceAreaCityName(place: ServiceAreaPlace): string {
  return place.kind === 'city' ? place.label.split(',')[0]?.trim() || place.label : '';
}

/** A town is covered once its city is already chosen. */
export function townCoveredBySelectedCity(
  place: ServiceAreaPlace,
  selected: ServiceAreaPlace[],
): boolean {
  if (place.kind !== 'town' || !place.parentCity) return false;
  return selected.some((item) => samePlaceName(serviceAreaCityName(item), place.parentCity));
}
