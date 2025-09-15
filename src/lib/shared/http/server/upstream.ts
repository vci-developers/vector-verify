import { cookies } from 'next/headers';
import { COOKIE } from '@/lib/auth/cookies/constants';
import type { RefreshRequestDto, RefreshResponseDto } from '@/lib/entities/auth/dto';
import { clearAuthCookies, setAccessCookie } from '@/lib/auth/cookies/server';
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
  const cookieJar = await cookies();
  const accessToken = cookieJar.get(COOKIE.ACCESS)?.value ?? null;
  const refreshToken = cookieJar.get(COOKIE.REFRESH)?.value ?? null;

  const url = buildUpstreamUrl(path, init.query);

  const headers = new Headers(init.headers ?? {});
  if (!headers.has('accept')) headers.set('accept', 'application/json');
  if (accessToken && !headers.has('authorization')) {
    headers.set('authorization', `Bearer ${accessToken}`);
  }

  let response = await fetchWithTimeout(url, {
    ...init,
    headers,
    body: init.bodyBuffer ?? init.body ?? undefined,
    cache: 'no-store',
    redirect: 'manual',
    timeoutMs: init.timeoutMs,
  });
  if (response.status !== 401 || !refreshToken) {
    return response;
  }

  const refreshUrl = buildUpstreamUrl('auth/refresh');
  const refreshPayload: RefreshRequestDto = { refreshToken };
  const refreshResponse = await fetchWithTimeout(refreshUrl, {
    method: 'POST',
    headers: new Headers({
      accept: 'application/json',
      'content-type': 'application/json',
    }),
    body: JSON.stringify(refreshPayload),
    cache: 'no-store',
    redirect: 'manual',
    timeoutMs: init.timeoutMs,
  });
  if (!refreshResponse.ok) {
    await clearAuthCookies();
    return response;
  }

  const refreshData: RefreshResponseDto = await refreshResponse.json();
  await setAccessCookie(refreshData.accessToken);

  const retryHeaders = new Headers(headers);
  retryHeaders.set('authorization', `Bearer ${refreshData.accessToken}`);
  const retryResponse = await fetchWithTimeout(url, {
    ...init,
    headers: retryHeaders,
    body: init.bodyBuffer ?? init.body ?? undefined,
    cache: 'no-store',
    redirect: 'manual',
    timeoutMs: init.timeoutMs,
  });
  return retryResponse;
}

export default upstreamFetch;
