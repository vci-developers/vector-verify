import bff from '@/lib/shared/http/client/bff-client';
import type {
  SignupRequestDto,
  SignupResponseDto,
} from '@/lib/entities/auth/dto';
import { createJsonRequestInit } from '@/lib/shared/http/core/json';

export async function signUpWithCredentials(
  input: SignupRequestDto,
): Promise<SignupResponseDto> {
  return await bff<SignupResponseDto>('auth/signup', {
    method: 'POST',
    ...createJsonRequestInit({ email: input.email, password: input.password }),
  });
}
