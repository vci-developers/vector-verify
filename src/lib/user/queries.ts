import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { User } from '@/lib/user/model';
import { getUserProfile } from './api';

type UserProfileQueryKey = ['user', 'profile'];

export function useUserProfileQuery(
  options?: Omit<
    UseQueryOptions<User, Error, User, UserProfileQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['user', 'profile'] as UserProfileQueryKey,
    queryFn: getUserProfile,
    staleTime: 60 * 1000,
    ...(options ?? {}),
  });
}
