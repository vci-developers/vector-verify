'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { User } from '@/features/user/types';
import { getUserProfile } from '@/features/user/api/get-user-profile';
import {
  userKeys,
  type UserProfileQueryKey,
} from '@/features/user/api/user-keys';

export function useUserProfileQuery(
  options?: Omit<
    UseQueryOptions<User, Error, User, UserProfileQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: userKeys.profile() as UserProfileQueryKey,
    queryFn: getUserProfile,
    ...(options ?? {}),
  });
}
