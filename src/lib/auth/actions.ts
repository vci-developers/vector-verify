'use server';

import { cookies } from 'next/headers';
import { ENV } from '@/lib/env';
import { COOKIE, COOKIE_AGE, BASE_COOKIE_OPTIONS } from '@/lib/auth/cookies';
import { LoginSchema, SignupSchema } from '@/lib/auth/schema';
import type {
  LoginRequestDto,
  LoginResponseDto,
  SignupRequestDto,
  SignupResponseDto,
} from '@/lib/dto/auth';
import { mapUserDtoToDomain } from '@/lib/mappers/user.mapper';
import type { User } from '@/lib/domain/user';
import { ErrorResponseDto } from '../dto/error';

export type AuthActionResult =
  | { ok: true; user: User; message?: string }
  | { ok: false; error: string; status?: number };

async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieJar = await cookies();
  cookieJar.set({
    name: COOKIE.ACCESS,
    value: accessToken,
    ...BASE_COOKIE_OPTIONS,
    maxAge: COOKIE_AGE.ACCESS,
  });

  cookieJar.set({
    name: COOKIE.REFRESH,
    value: refreshToken,
    ...BASE_COOKIE_OPTIONS,
    maxAge: COOKIE_AGE.REFRESH,
  });
}

async function clearAuthCookies() {
  const cookieJar = await cookies();
  cookieJar.delete(COOKIE.ACCESS);
  cookieJar.delete(COOKIE.REFRESH);
}

export async function loginAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const payload: LoginRequestDto = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  const parsed = LoginSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid credentials' };
  }

  const response = await fetch(`${ENV.API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = response.statusText || `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as Partial<ErrorResponseDto>;
      if (typeof body.error === 'string' && body.error) message = body.error;
    } catch {}
    return { ok: false, error: message, status: response.status };
  }

  const data: LoginResponseDto = await response.json();
  await setAuthCookies(data.tokens.accessToken, data.tokens.refreshToken);

  return {
    ok: true,
    user: mapUserDtoToDomain(data.user),
    message: data.message,
  };
}

export async function signupAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const payload: SignupRequestDto = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  const parsed = SignupSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid credentials' };
  }

  const response = await fetch(`${ENV.API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = response.statusText || `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as Partial<ErrorResponseDto>;
      if (typeof body.error === 'string' && body.error) message = body.error;
    } catch {}
    return { ok: false, error: message, status: response.status };
  }

  const data: SignupResponseDto = await response.json();
  await setAuthCookies(data.tokens.accessToken, data.tokens.refreshToken);

  return {
    ok: true,
    user: mapUserDtoToDomain(data.user),
    message: data.message,
  };
}

export async function logoutAction(): Promise<void> {
    await clearAuthCookies();
}
