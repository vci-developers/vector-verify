'use server';

import { LoginSchema } from '@/lib/auth/validation/schema';
import type { LoginRequestDto, LoginResponseDto } from '@/lib/entities/auth/dto';
import { mapUserDtoToDomain } from '@/lib/entities/user/mapper';
import { parseApiError } from '@/lib/shared/http/core/parse-api-error';
import { setAccessCookie, setRefreshCookie } from '@/lib/auth/cookies/server';
import { ENV } from '@/lib/shared/config/env';
import { fetchWithTimeout } from '@/lib/shared/http/core/fetch-with-timeout';
import type { AuthActionResult } from './types';

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

  try {
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
    await setAccessCookie(data.tokens.accessToken);
    await setRefreshCookie(data.tokens.refreshToken);

    return {
      ok: true,
      user: mapUserDtoToDomain(data.user),
      message: data.message,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to login. Please try again.';
    return { ok: false, error: message };
  }
}
