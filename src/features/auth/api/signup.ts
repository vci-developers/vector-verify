import bff from '@/lib/api/bff-client';
import type { SignupRequestDto, AuthPayload, SignupResponseDto } from '@/features/auth/types';
import { mapAuthResponseDtoToPayload } from '@/features/auth/types';
import { createJsonRequestInit } from '@/lib/shared/http/core/json';

export async function signUpWithCredentials(
  input: SignupRequestDto,
): Promise<AuthPayload> {
  const payload: SignupRequestDto = {
    email: input.email,
    password: input.password,
  };

  const response = await bff<SignupResponseDto>('auth/signup', {
    method: 'POST',
    ...createJsonRequestInit(payload),
  });

  return mapAuthResponseDtoToPayload(response);
}
