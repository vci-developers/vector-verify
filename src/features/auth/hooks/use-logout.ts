'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { logoutAndRedirect } from '@/features/auth/api/logout';

export function useLogoutMutation(
  options?: Omit<
    UseMutationOptions<void, Error, string | undefined, unknown>,
    'mutationFn'
  >,
) {
  return useMutation<void, Error, string | undefined>({
    mutationFn: logoutAndRedirect,
    ...(options ?? {}),
  });
}
