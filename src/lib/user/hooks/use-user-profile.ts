import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { User } from '@/lib/user/model';
import { getUserProfile } from '../client/get-user-profile';
import { userKeys, type UserProfileQueryKey } from '../keys';

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
