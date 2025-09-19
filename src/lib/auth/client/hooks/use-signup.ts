'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { SignupRequestDto, SignupResponseDto } from '@/lib/entities/auth/dto';
import { signUpWithCredentials } from '@/lib/auth/client/signup';

export function useSignUpMutation(
  options?: Omit<
    UseMutationOptions<SignupResponseDto, Error, SignupRequestDto, unknown>,
    'mutationFn'
  >,
) {
  return useMutation<SignupResponseDto, Error, SignupRequestDto>({
    mutationFn: signUpWithCredentials,
    ...(options ?? {}),
  });
}
