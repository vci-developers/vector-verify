import bff from '@/lib/shared/http/client/bff-client';
import type {
  SignupRequestDto,
  SignupResponseDto,
} from '@/lib/entities/auth/dto';
import { createJsonRequestInit } from '@/lib/shared/http/core/json';

export async function signUpWithCredentials(
  input: SignupRequestDto,
): Promise<SignupResponseDto> {
  const payload: SignupRequestDto = { email: input.email, password: input.password};
  return await bff<SignupResponseDto>('auth/signup', {
    method: 'POST',
    ...createJsonRequestInit(payload),
  });
}
