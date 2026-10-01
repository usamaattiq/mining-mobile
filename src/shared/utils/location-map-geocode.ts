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
  }>;
};

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
