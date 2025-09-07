'use server';

import { ENV } from '@/lib/env';
import { LoginSchema, SignupSchema } from '@/lib/auth/schema';
import type {
  LoginRequestDto,
  LoginResponseDto,
  SignupRequestDto,
  SignupResponseDto,
} from '@/lib/dto/auth';
import { mapUserDtoToDomain } from '@/lib/mappers/user.mapper';
import type { User } from '@/lib/domain/user';
import { parseApiError } from '@/lib/api/parse-api-error';
import { clearAuthCookies, setAuthCookies } from './cookies.server';

export type AuthActionResult =
  | { ok: true; user: User; message?: string }
  | { ok: false; error: string; status?: number };

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
    const errorMessage = await parseApiError(response);
    return { ok: false, error: errorMessage, status: response.status };
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
    const errorMessage = await parseApiError(response);
    return { ok: false, error: errorMessage, status: response.status };
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
