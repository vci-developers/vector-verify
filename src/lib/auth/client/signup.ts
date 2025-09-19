import bff from '@/lib/shared/http/client/bff-client';
import type {
  SignupRequestDto,
  SignupResponseDto,
} from '@/lib/entities/auth/dto';

export async function signUpWithCredentials(
  input: SignupRequestDto,
): Promise<SignupResponseDto> {
  return await bff<SignupResponseDto>('auth/signup', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: input.email, password: input.password }),
  });
}
