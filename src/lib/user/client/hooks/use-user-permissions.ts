'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getUserPermissions } from '../get-user-permissions';
import { type UserPermissions } from '../../permissions';
import { userKeys, type UserPermissionsQueryKey } from '../../keys';

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

