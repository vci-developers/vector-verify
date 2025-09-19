import 'server-only';
import { getToken } from 'next-auth/jwt';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { ENV } from '@/lib/shared/config/env';
import { parseApiError } from '@/lib/shared/http/core/parse-api-error';
import { upstreamFetch } from '@/lib/shared/http/server/upstream';
import type { RefreshRequestDto, RefreshResponseDto } from '@/lib/entities/auth/dto';

export function decodeJwtExp(token?: string): number | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const payloadJson = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
        'utf-8',
      ),
    );
    const expiresEpochMs =
      typeof payloadJson?.exp === 'number' ? payloadJson.exp * 1000 : null; // ms
    return expiresEpochMs;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResponseDto> {
  const payload: RefreshRequestDto = { refreshToken };
  const response = await upstreamFetch('auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }
  return (await response.json()) as RefreshResponseDto;
}

export async function getAccessToken(): Promise<string | null> {
  const incomingHeaders = await headers();
  const requestHeaders: Record<string, string> = {};
  incomingHeaders.forEach((value, key) => {
    requestHeaders[key] = value;
  });
  const proto =
    requestHeaders['x-forwarded-proto'] ||
    requestHeaders['X-Forwarded-Proto'] ||
    'http';
  const host =
    requestHeaders['x-forwarded-host'] ||
    requestHeaders['X-Forwarded-Host'] ||
    requestHeaders['host'] ||
    requestHeaders['Host'] ||
    'localhost';
  const origin = `${proto}://${host}`;
  const request = new NextRequest(new Request(origin, { headers: requestHeaders }));
  const token = await getToken({ req: request, secret: ENV.NEXTAUTH_SECRET });
  const accessToken = (token as Record<string, unknown> | null)?.accessToken;
  return typeof accessToken === 'string' ? accessToken : null;
}

export const DAY_SECONDS = 24 * 60 * 60;
export const SESSION_MAX_AGE_SECONDS = 28 * DAY_SECONDS;
export const SESSION_UPDATE_AGE_SECONDS = 1 * DAY_SECONDS;

export const ACCESS_FALLBACK_MS = SESSION_UPDATE_AGE_SECONDS * 1000;

export const REFRESH_BUFFER_MS = 10 * 60 * 1000;
