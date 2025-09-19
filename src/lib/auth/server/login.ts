import {
  createJsonRequestInit,
  HttpError,
  parseApiErrorResponse,
} from '@/lib/shared/http/core';
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
    const error = await parseApiErrorResponse(response);
    throw new HttpError(error.message, error.status, error.body);
  }
  return (await response.json()) as LoginResponseDto;
}
