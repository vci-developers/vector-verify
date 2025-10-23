'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getUserPermissions } from '@/features/user/api/get-user-permissions';
import type { UserPermissions } from '@/features/user/types';
import {
  userKeys,
  type UserPermissionsQueryKey,
} from '@/features/user/api/user-keys';

export function useUserPermissionsQuery(
  options?: Omit<
    UseQueryOptions<
      UserPermissions,
      Error,
      UserPermissions,
      UserPermissionsQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: userKeys.permissions() as UserPermissionsQueryKey,
    queryFn: getUserPermissions,
    ...(options ?? {}),
  });
}
