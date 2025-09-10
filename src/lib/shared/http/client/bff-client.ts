import { parseApiError } from '@/lib/shared/http/core/parse-api-error';
import {
  fetchWithTimeout,
  DEFAULT_FETCH_TIMEOUT_MS,
} from '@/lib/shared/http/core/fetch-with-timeout';
import { HttpError } from '@/lib/shared/http/core/http-error';

export type BffInit = RequestInit & { timeoutMs?: number };

export async function bff<T>(path: string, init: BffInit = {}): Promise<T> {
  const url = `/api/bff/${path.replace(/^\/+/, '')}`;
  const { timeoutMs = DEFAULT_FETCH_TIMEOUT_MS, ...rest } = init;
  let response: Response;
  try {
    response = await fetchWithTimeout(url, {
      ...rest,
      credentials: 'include',
      cache: 'no-store',
      timeoutMs,
    });
  } catch {
    throw new HttpError('Network error. Please try again.', 0);
  }

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new HttpError(message, response.status);
  }

  if (
    response.status === 204 ||
    response.status === 205 ||
    response.headers.get('content-length') === '0'
  ) {
    return null as unknown as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as unknown as T;
}

export default bff;
