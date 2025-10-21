import type { QueryKey } from '@tanstack/react-query';

export const userKeys = {
  root: ['user'] as const,
  profile: () => [...userKeys.root, 'profile'] as const,
  permissions: () => [...userKeys.root, 'permissions'] as const,
};
export type UserProfileQueryKey = ReturnType<typeof userKeys.profile> &
  QueryKey;
export type UserPermissionsQueryKey = ReturnType<typeof userKeys.permissions> &
  QueryKey;
