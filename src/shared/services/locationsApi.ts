import { apiFetch } from './api';

export type PlacePrediction = {
  placeId: string;
  description: string;
};

export type ResolvedLocation = {
  address: string;
  town?: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

/** Identifies the caller when there's no session token yet (mid sign-up, phone already OTP-verified). */
export type CallerIdentity = { dialCode: string; phoneNumber: string } | undefined;

export function createPlacesSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}

function callerParams(caller: CallerIdentity): { dialCode?: string; phoneNumber?: string } {
  return caller ? { dialCode: caller.dialCode, phoneNumber: caller.phoneNumber } : {};
}

export const locationsApi = {
  autocomplete(
    input: string,
    sessionToken: string,
    caller?: CallerIdentity,
  ): Promise<PlacePrediction[]> {
    const qs = buildQuery({ input, sessiontoken: sessionToken, ...callerParams(caller) });
    return apiFetch(`/locations/autocomplete?${qs}`);
  },

  placeDetails(
    placeId: string,
    sessionToken: string,
    caller?: CallerIdentity,
  ): Promise<ResolvedLocation | null> {
    const qs = buildQuery({ placeId, sessiontoken: sessionToken, ...callerParams(caller) });
    return apiFetch(`/locations/details?${qs}`);
  },
};
