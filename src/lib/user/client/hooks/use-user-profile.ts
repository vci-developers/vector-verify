'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { User } from '@/lib/entities/user/model';
import { getUserProfile } from '@/lib/user/client';
import { userKeys, type UserProfileQueryKey } from '@/lib/user';

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
