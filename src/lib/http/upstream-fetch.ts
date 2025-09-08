import { cookies } from 'next/headers';
import { COOKIE } from '@/lib/auth/cookies/constants';
import type { RefreshRequestDto, RefreshResponseDto } from '@/lib/auth/dto';
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies/server';
import { buildUpstreamUrl, type QueryInput } from './build-url';

export async function upstreamFetch(
  path: string,
  init?: RequestInit & { bodyBuffer?: ArrayBuffer | null; query?: QueryInput },
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

  let response = await fetch(url, {
    method,
    headers,
    body: init?.bodyBuffer ?? init?.body ?? undefined,
    cache: 'no-store',
    redirect: 'manual',
  });

  if (response.status === 401 && refreshToken && !path.startsWith('auth/refresh')) {
    const refreshResponse = await fetch(buildUpstreamUrl('auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken } as RefreshRequestDto),
      cache: 'no-store',
    });

    if (refreshResponse.ok) {
      const data: RefreshResponseDto = await refreshResponse.json();
      await setAuthCookies(data.accessToken, refreshToken);

      const retryHeaders = new Headers(init?.headers);
      retryHeaders.set('Authorization', `Bearer ${data.accessToken}`);

      response = await fetch(url, {
        method,
        headers: retryHeaders,
        body: init?.bodyBuffer ?? init?.body ?? undefined,
        cache: 'no-store',
        redirect: 'manual',
      });
    } else {
      await clearAuthCookies();
    }
  }

  return response;
}
