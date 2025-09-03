import { cookies } from 'next/headers';
import { ENV } from '@/lib/env';
import { COOKIE, COOKIE_AGE, BASE_COOKIE_OPTIONS } from '@/lib/auth/cookies';
import type { RefreshRequestDto, RefreshResponseDto } from '@/lib/dto/auth';

type QueryInput =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>;

async function setAccessTokenCookie(token: string) {
  const cookieJar = await cookies();
  cookieJar.set({
    name: COOKIE.ACCESS,
    value: token,
    ...BASE_COOKIE_OPTIONS,
    maxAge: COOKIE_AGE.ACCESS,
  });
}

export function buildUpstreamUrl(path: string, query?: QueryInput) {
  const base = ENV.API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  let search = "";
  if (query) {
    if (typeof query === "string") {
      search = query ? (query.startsWith("?") ? query : `?${query}`) : "";
    } else {
      const params =
        query instanceof URLSearchParams
          ? query
          : new URLSearchParams(
              Object.entries(query)
                .filter(([, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)])
            );
      const queryString = params.toString();
      search = queryString ? `?${queryString}` : "";
    }
  }

  return `${base}/${cleanPath}${search}`;
}

export function forwardRequestHeaders(request: Request): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (
      [
        'host',
        'connection',
        'content-length',
        'cookie',
        'authorization',
      ].includes(key.toLowerCase())
    )
      return;
    headers.set(key, value);
  });
  return headers;
}

export function forwardResponseHeaders(response: Response): Headers {
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (['transfer-encoding', 'content-encoding', 'content-length'].includes(key.toLowerCase()))
      return;
    headers.set(key, value);
  });
  return headers;
}

export async function upstreamFetch(
  path: string,
  init?: RequestInit & { bodyBuffer?: ArrayBuffer | null; query?: QueryInput },
): Promise<Response> {
  const cookieJar = await cookies();
  const accessToken = cookieJar.get(COOKIE.ACCESS)?.value ?? null;
  const refreshToken = cookieJar.get(COOKIE.REFRESH)?.value ?? null;

  const method = (init?.method ?? 'GET').toUpperCase();
  const headers = new Headers(init?.headers);
  if (!headers.has("authorization") && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = buildUpstreamUrl(path, init?.query);

  let response = await fetch(url, {
    method,
    headers,
    body: init?.bodyBuffer ?? init?.body ?? undefined,
    cache: 'no-store',
    redirect: 'manual',
  });

  if (response.status === 401 && refreshToken) {
    const refreshResponse = await fetch(buildUpstreamUrl('auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken } as RefreshRequestDto),
      cache: 'no-store',
    });

    if (refreshResponse.ok) {
      const data: RefreshResponseDto = await refreshResponse.json();
      await setAccessTokenCookie(data.accessToken);

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
        cookieJar.delete(COOKIE.ACCESS);
        cookieJar.delete(COOKIE.REFRESH);
    }
  }

  return response;
}
