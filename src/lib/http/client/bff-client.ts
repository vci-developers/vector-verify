import { parseApiError } from '@/lib/http/core/parse-api-error';
import { fetchWithTimeout } from '@/lib/http/core/fetch-with-timeout';
import { HttpError } from '@/lib/http/core/http-error';

export async function bff<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const url = `/api/bff/${path.replace(/^\/+/, '')}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(url, {
      ...init,
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    throw new HttpError('Network error. Please try again.', 0);
  }

  if (!response.ok) {
    const errorMessage = await parseApiError(response);
    throw new HttpError(errorMessage, response.status);
  }

  if (
    response.status === 204 ||
    response.status === 205 ||
    response.headers.get('content-length') === '0'
  ) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as unknown as T;
}
