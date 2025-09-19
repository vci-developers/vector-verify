import { parseApiError } from '@/lib/shared/http/core/parse-api-error';
import { createJsonRequestInit } from '@/lib/shared/http/core/json';
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
    ...createJsonRequestInit(payload),
  });
  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }
  return (await response.json()) as LoginResponseDto;
}
