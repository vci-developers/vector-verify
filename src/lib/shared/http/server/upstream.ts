import 'server-only';
import { getAccessToken } from '@/lib/auth/server/tokens';
import { ENV } from '@/lib/shared/config/env';
import { fetchWithTimeout } from '@/lib/shared/http/core/fetch-with-timeout';
import { appendQuery, type QueryInput } from '@/lib/shared/http/core/query';

export type UpstreamInit = RequestInit & {
  bodyBuffer?: ArrayBuffer | null;
  query?: QueryInput;
  timeoutMs?: number;
};

export function buildUpstreamUrl(path: string, query?: QueryInput): string {
  const base = ENV.API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return appendQuery(`${base}/${cleanPath}`, query);
}

export async function upstreamFetch(
  path: string,
  init: UpstreamInit = {},
): Promise<Response> {
  const accessToken = await getAccessToken();

  const url = buildUpstreamUrl(path, init.query);

  const headers = new Headers(init.headers ?? {});
  if (!headers.has('accept')) headers.set('accept', 'application/json');
  if (accessToken && !headers.has('authorization')) {
    headers.set('authorization', `Bearer ${accessToken}`);
  }

  const response = await fetchWithTimeout(url, {
    ...init,
    headers,
    body: init.bodyBuffer ?? init.body ?? undefined,
    cache: 'no-store',
    redirect: 'manual',
    timeoutMs: init.timeoutMs,
  });
  return response;
}
