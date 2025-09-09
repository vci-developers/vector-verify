'use server';

import { LoginSchema } from '@/lib/auth/validation/schema';
import type { LoginRequestDto, LoginResponseDto } from '@/lib/auth/dto';
import type { User } from '@/lib/user/model';
import { mapUserDtoToDomain } from '@/lib/user/mapper';
import { parseApiError } from '@/lib/http/core/parse-api-error';
import { setAuthCookies } from '@/lib/auth/cookies/server';
import { ENV } from '@/lib/config/env';
import { fetchWithTimeout } from '@/lib/http/core/fetch-with-timeout';

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

  const response = await fetchWithTimeout(
    `${ENV.API_BASE_URL.replace(/\/+$/, '')}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(payload),
    },
  );

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
