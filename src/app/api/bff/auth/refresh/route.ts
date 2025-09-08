import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ENV } from '@/lib/config/env';
import { COOKIE } from '@/lib/auth/cookies/constants';
import type { RefreshResponseDto } from '@/lib/auth/dto';
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies/server';
import { parseApiError } from '@/lib/http/parse-api-error';

export async function POST(_req: NextRequest) {
  const cookieJar = await cookies();
  const refreshToken = cookieJar.get(COOKIE.REFRESH)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token available.' }, { status: 401 });
  }

  const upstreamResponse = await fetch(`${ENV.API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!upstreamResponse.ok) {
    await clearAuthCookies();
    const errorMessage = await parseApiError(upstreamResponse);
    return NextResponse.json({ error: errorMessage }, { status: upstreamResponse.status });
  }

  const data: RefreshResponseDto = await upstreamResponse.json();
  const newAccessToken = data.accessToken;

  await setAuthCookies(newAccessToken, refreshToken);

  return NextResponse.json(
    { message: data.message ?? 'Session refreshed successfully.' },
    { status: 200 },
  );
}
