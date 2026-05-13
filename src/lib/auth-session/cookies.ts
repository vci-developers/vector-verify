import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const ACCESS_COOKIE_NAME = 'accessToken';
export const REFRESH_COOKIE_NAME = 'refreshToken';

const ACCESS_TOKEN_TTL = 24 * 60 * 60;
const REFRESH_TOKEN_TTL = 28 * 24 * 60 * 60;

export function setAccessCookie(response: NextResponse, accessToken: string) {
    const maxAge = Math.max(0, ACCESS_TOKEN_TTL - 60); // Subtract 60 seconds to account for potential delays

    response.cookies.set(ACCESS_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
    });
}

export function setRefreshCookie(response: NextResponse, refreshToken: string) {
    response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: REFRESH_TOKEN_TTL,
    });
}

export async function clearAuthCookies() {
    (await cookies()).delete(ACCESS_COOKIE_NAME);
    (await cookies()).delete(REFRESH_COOKIE_NAME);
}
