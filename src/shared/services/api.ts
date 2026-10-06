import { env } from '@/shared/config/env';

// Set by the auth module once it exists, so this client can attach the
// current session's token without owning any auth state itself.
let authTokenProvider: (() => string | null) | null = null;

export function setAuthTokenProvider(provider: () => string | null): void {
  authTokenProvider = provider;
}

let sessionRevokedHandler: (() => void) | null = null;

export function setSessionRevokedHandler(handler: () => void): void {
  sessionRevokedHandler = handler;
}

// Set by authStore — attempts to silently renew the access token using the
// stored refresh token. Resolves true if the retry should go ahead with a
// fresh token, false if the session is actually gone (bad/expired refresh
// token too) and sessionRevokedHandler should run instead.
let refreshHandler: (() => Promise<boolean>) | null = null;

export function setRefreshHandler(handler: () => Promise<boolean>): void {
  refreshHandler = handler;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string | undefined,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

const REQUEST_TIMEOUT_MS = 20_000;

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    signal?: AbortSignal;
    skipRefresh?: boolean;
  } = {},
): Promise<T> {
  const token = authTokenProvider?.();

  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  // Honor caller abort (e.g. screen blur) and the request timeout.
  const onCallerAbort = () => timeoutController.abort();
  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timeout);
      throw options.signal.reason instanceof Error
        ? options.signal.reason
        : new DOMException('Aborted', 'AbortError');
    }
    options.signal.addEventListener('abort', onCallerAbort, { once: true });
  }

  let res: Response;
  try {
    res = await fetch(`${env.API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: timeoutController.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Caller cancelled (focus/blur) — rethrow so screens can ignore it.
      if (options.signal?.aborted) throw error;
      throw new ApiError('Request timed out', 0, 'TIMEOUT', undefined);
    }
    throw new ApiError('Network request failed', 0, 'NETWORK_ERROR', error);
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', onCallerAbort);
  }

  const text = await res.text();
  let payload: ApiEnvelope<T> | undefined;
  try {
    payload = text ? (JSON.parse(text) as ApiEnvelope<T>) : undefined;
  } catch {
    throw new ApiError(
      'Received an invalid response from the server',
      res.status,
      'INVALID_RESPONSE',
      text,
    );
  }

  if (!res.ok || !payload || payload.success === false) {
    const errorPayload = payload && payload.success === false ? payload.error : undefined;

    if (res.status === 401 && errorPayload?.code === 'UNAUTHORIZED') {
      if (!options.skipRefresh && refreshHandler) {
        const refreshed = await refreshHandler();
        if (refreshed) {
          return apiFetch<T>(path, { ...options, skipRefresh: true });
        }
      }
      sessionRevokedHandler?.();
    }

    throw new ApiError(
      errorPayload?.message ?? `Request failed: ${options.method ?? 'GET'} ${path}`,
      res.status,
      errorPayload?.code,
      errorPayload?.details ?? payload,
    );
  }

  return payload.data;
}
