import bff from '@/lib/api/bff-client';
import type { UserPermissionsResponseDto, UserPermissions } from '@/features/user/types';

export async function getUserPermissions(): Promise<UserPermissions> {
  const data = await bff<UserPermissionsResponseDto>('users/permissions', {
    method: 'GET',
  });
  return data.permissions;
}
