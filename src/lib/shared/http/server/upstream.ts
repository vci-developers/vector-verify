import { cookies } from 'next/headers';
import { COOKIE } from '@/lib/auth/cookies/constants';
import type { RefreshRequestDto, RefreshResponseDto } from '@/lib/auth/dto';
import { clearAuthCookies, setAccessCookie } from '@/lib/auth/cookies/server';
import { ENV } from '@/lib/shared/config/env';
import {
  fetchWithTimeout,
  DEFAULT_FETCH_TIMEOUT_MS,
} from '@/lib/shared/http/core/fetch-with-timeout';

export type QueryInput =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>;

export type UpstreamInit = RequestInit & {
  bodyBuffer?: ArrayBuffer | null;
  query?: QueryInput;
  timeoutMs?: number;
};

export function buildUpstreamUrl(path: string, query?: QueryInput): string {
  const base = ENV.API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  let search = '';
  if (query) {
    if (typeof query === 'string') {
      search = query.startsWith('?') ? query : `?${query}`;
    } else if (query instanceof URLSearchParams) {
      const q = query.toString();
      search = q ? `?${q}` : '';
    } else if (typeof query === 'object') {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(query)) {
        if (v === null || typeof v === 'undefined') continue;
        params.set(k, String(v));
      }
      const q = params.toString();
      search = q ? `?${q}` : '';
    }
  }
  return `${base}/${cleanPath}${search}`;
}

export async function upstreamFetch(
  path: string,
  init: UpstreamInit = {},
): Promise<Response> {
  const cookieJar = await cookies();
  const access = cookieJar.get(COOKIE.ACCESS)?.value ?? null;
  const refresh = cookieJar.get(COOKIE.REFRESH)?.value ?? null;
  
  const url = buildUpstreamUrl(path, init.query);
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('accept')) headers.set('accept', 'application/json');
  if (access && !headers.has('authorization')) {
    headers.set('authorization', `Bearer ${access}`);
  }
  let response = await fetchWithTimeout(url, {
    ...init,
    headers,
    body: init.bodyBuffer ?? init.body ?? undefined,
    cache: 'no-store',
    redirect: 'manual',
    timeoutMs: init.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS,
  });
  if (response.status !== 401 || !refresh) {
    return response;
  }

  const refreshUrl = buildUpstreamUrl('auth/refresh');
  const refreshPayload: RefreshRequestDto = { refreshToken: refresh };
  const refreshRes = await fetchWithTimeout(refreshUrl, {
    method: 'POST',
    headers: new Headers({
      accept: 'application/json',
      'content-type': 'application/json',
    }),
    body: JSON.stringify(refreshPayload),
    cache: 'no-store',
    redirect: 'manual',
    timeoutMs: init.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS,
  });
  if (!refreshRes.ok) {
    await clearAuthCookies();
    return response;
  }
  const refreshData: RefreshResponseDto = await refreshRes.json();
  await setAccessCookie(refreshData.accessToken);

  const retryHeaders = new Headers(headers);
  retryHeaders.set('authorization', `Bearer ${refreshData.accessToken}`);
  const retryRes = await fetchWithTimeout(url, {
    ...init,
    headers: retryHeaders,
    body: init.bodyBuffer ?? init.body ?? undefined,
    cache: 'no-store',
    redirect: 'manual',
    timeoutMs: init.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS,
  });
  return retryRes;
}

export default upstreamFetch;
