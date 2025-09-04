export type JwtPayload = { exp?: number; iat?: number; [key: string]: unknown };

export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );

    const decoded = atob(padded);

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtExpiringSoon(
  token: string | null | undefined,
  bufferSeconds: number = 900,
): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + bufferSeconds;
}
