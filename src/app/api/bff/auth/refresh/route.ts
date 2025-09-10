import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ENV } from '@/lib/shared/config/env';
import { COOKIE } from '@/lib/auth/cookies/constants';
import type { RefreshResponseDto } from '@/lib/auth/dto';
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies/server';
import { parseApiError, fetchWithTimeout } from '@/lib/shared/http/core';

export async function POST() {
  const cookieJar = await cookies();
  const refreshToken = cookieJar.get(COOKIE.REFRESH)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'No refresh token available.' },
      { status: 401 },
    );
  }

  try {
    const upstreamResponse = await fetchWithTimeout(
      `${ENV.API_BASE_URL.replace(/\/+$/, '')}/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      },
    );

    if (!upstreamResponse.ok) {
      await clearAuthCookies();
      const errorMessage = await parseApiError(upstreamResponse);
      return NextResponse.json(
        { error: errorMessage },
        { status: upstreamResponse.status },
      );
    }

    const data: RefreshResponseDto = await upstreamResponse.json();
    const newAccessToken = data.accessToken;

    await setAuthCookies(newAccessToken, refreshToken);

    return NextResponse.json(
      { message: data.message ?? 'Session refreshed successfully.' },
      { status: 200 },
    );
  } catch (error) {
    await clearAuthCookies();
    const message =
      error instanceof Error ? error.message : 'Unable to refresh session.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
