import {
  appendQuery,
  fetchWithTimeout,
  HttpError,
  HTTP_STATUS,
  parseApiError,
  type QueryInput,
} from '@/lib/shared/http/core';

type BffInit = RequestInit & { timeoutMs?: number; query?: QueryInput };

export async function bff<T>(path: string, init: BffInit = {}): Promise<T> {
  const base = `/api/bff/${path.replace(/^\/+/, '')}`;
  const { timeoutMs, query, ...rest } = init;
  const url = appendQuery(base, query);
  let response: Response;
  try {
    response = await fetchWithTimeout(url, {
      ...rest,
      credentials: 'include',
      cache: 'no-store',
      timeoutMs,
    });
  } catch {
    throw new HttpError('Network error. Please try again.', HTTP_STATUS.NETWORK_ERROR);
  }

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new HttpError(message, response.status);
  }

  if (
    response.status === HTTP_STATUS.NO_CONTENT ||
    response.status === HTTP_STATUS.RESET_CONTENT ||
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
