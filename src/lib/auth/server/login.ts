import { parseApiError } from '@/lib/shared/http/core/parse-api-error';
import { upstreamFetch } from '@/lib/shared/http/server/upstream';
import type {
  LoginRequestDto,
  LoginResponseDto,
} from '@/lib/entities/auth/dto';

export async function loginToBackend(
  email: string,
  password: string,
): Promise<LoginResponseDto> {
  const payload: LoginRequestDto = { email, password };
  const response = await upstreamFetch('auth/login', {
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
  return (await response.json()) as LoginResponseDto;
}

