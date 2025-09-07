export const COOKIE = {
  ACCESS: 'vc_access',
  REFRESH: 'vc_refresh',
} as const;

export const COOKIE_AGE = {
  ACCESS: 30 * 60,
  REFRESH: 60 * 60 * 24 * 28,
} as const;

export const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
