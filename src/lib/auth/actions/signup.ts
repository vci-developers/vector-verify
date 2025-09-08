'use server';

import { SignupSchema } from '@/lib/auth/validation/schema';
import type { SignupRequestDto, SignupResponseDto } from '@/lib/auth/dto';
import { mapUserDtoToDomain } from '@/lib/user/mapper';
import { parseApiError } from '@/lib/http/parse-api-error';
import { setAuthCookies } from '@/lib/auth/cookies/server';
import { ENV } from '@/lib/config/env';
import type { AuthActionResult } from './login';

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

  const response = await fetch(
    `${ENV.API_BASE_URL.replace(/\/+$/, '')}/auth/signup`,
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

  const data: SignupResponseDto = await response.json();
  await setAuthCookies(data.tokens.accessToken, data.tokens.refreshToken);

  return {
    ok: true,
    user: mapUserDtoToDomain(data.user),
    message: data.message,
  };
}
