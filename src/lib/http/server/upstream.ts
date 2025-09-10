import { cookies } from 'next/headers';
import { COOKIE } from '@/lib/auth/cookies/constants';
import type { RefreshRequestDto, RefreshResponseDto } from '@/lib/auth/dto';
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies/server';
import { ENV } from '@/lib/config/env';
import { fetchWithTimeout } from '../core/fetch-with-timeout';

type QueryInput =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>;

function buildUpstreamUrl(path: string, query?: QueryInput) {
  const base = ENV.API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  let search = '';

  if (query) {
    if (typeof query === 'string') {
      search = query ? (query.startsWith('?') ? query : `?${query}`) : '';
    } else {
      const params =
        query instanceof URLSearchParams
          ? query
          : new URLSearchParams(
              Object.entries(query)
                .filter(([, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)]),
            );
      const queryString = params.toString();
      search = queryString ? `?${queryString}` : '';
    }
  }

  return `${base}/${cleanPath}${search}`;
}

export async function upstreamFetch(
  path: string,
  init?: RequestInit & {
    bodyBuffer?: ArrayBuffer | null;
    query?: QueryInput;
    timeoutMs?: number;
  },
): Promise<Response> {
  const cookieJar = await cookies();
  const url = buildUpstreamUrl(path, init?.query);
  const method = (init?.method ?? 'GET').toUpperCase();

  const accessToken = cookieJar.get(COOKIE.ACCESS)?.value ?? null;
  const refreshToken = cookieJar.get(COOKIE.REFRESH)?.value ?? null;

  const headers = new Headers(init?.headers);
  if (!headers.has('authorization') && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetchWithTimeout(url, {
    method,
    headers,
    body: init?.bodyBuffer ?? init?.body ?? undefined,
    cache: 'no-store',
    redirect: 'manual',
    timeoutMs: init?.timeoutMs,
  });

  if (response.status === 401 && refreshToken && !path.startsWith('auth/refresh')) {
    const refreshResponse = await fetchWithTimeout(buildUpstreamUrl('auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken } as RefreshRequestDto),
      cache: 'no-store',
      timeoutMs: 10_000,
    });

    if (refreshResponse.ok) {
      const data: RefreshResponseDto = await refreshResponse.json();
      await setAuthCookies(data.accessToken, refreshToken);

      const retryHeaders = new Headers(init?.headers);
      retryHeaders.set('Authorization', `Bearer ${data.accessToken}`);

      response = await fetchWithTimeout(url, {
        method,
        headers: retryHeaders,
        body: init?.bodyBuffer ?? init?.body ?? undefined,
        cache: 'no-store',
        redirect: 'manual',
        timeoutMs: init?.timeoutMs,
      });
    } else {
      await clearAuthCookies();
    }
  }

  return response;
}
