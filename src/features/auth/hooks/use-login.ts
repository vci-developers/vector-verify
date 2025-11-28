'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { SignInResponse } from 'next-auth/react';
import { loginWithCredentials } from '@/features/auth/api/login';
import type { LoginRequestDto } from '@/features/auth/types';

export function useLoginMutation(
  options?: Omit<
    UseMutationOptions<
      SignInResponse | undefined,
      Error,
      LoginRequestDto,
      unknown
    >,
    'mutationFn'
  >,
) {
  return useMutation<SignInResponse | undefined, Error, LoginRequestDto>({
    mutationFn: loginWithCredentials,
    ...(options ?? {}),
  });
}
