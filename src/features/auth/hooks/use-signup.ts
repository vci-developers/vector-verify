'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { SignupRequestDto, AuthPayload } from '@/features/auth/types';
import { signUpWithCredentials } from '@/features/auth/api/signup';

export function useSignUpMutation(
  options?: Omit<
    UseMutationOptions<AuthPayload, Error, SignupRequestDto, unknown>,
    'mutationFn'
  >,
) {
  return useMutation<AuthPayload, Error, SignupRequestDto>({
    mutationFn: signUpWithCredentials,
    ...(options ?? {}),
  });
}
