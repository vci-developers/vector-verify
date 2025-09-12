import { cookies } from 'next/headers';
import { COOKIE, BASE_COOKIE_OPTIONS, COOKIE_AGE } from './constants';

export async function setAccessCookie(accessToken: string) {
  const cookieJar = await cookies();
  cookieJar.set({
    name: COOKIE.ACCESS,
    value: accessToken,
    ...BASE_COOKIE_OPTIONS,
    maxAge: COOKIE_AGE.ACCESS,
  });
}

export async function setRefreshCookie(refreshToken: string) {
  const cookieJar = await cookies();
  cookieJar.set({
    name: COOKIE.REFRESH,
    value: refreshToken,
    ...BASE_COOKIE_OPTIONS,
    maxAge: COOKIE_AGE.REFRESH,
  });
}

export async function clearAuthCookies() {
  const cookieJar = await cookies();
  cookieJar.delete(COOKIE.ACCESS);
  cookieJar.delete(COOKIE.REFRESH);
}
