import { bff } from '@/lib/shared/http/client';
import { UserPermissionsResponseDto } from '@/lib/user';
import { UserPermissions } from '@/lib/user';

export async function getUserPermissions(): Promise<UserPermissions> {
  const data = await bff<UserPermissionsResponseDto>('users/permissions', {
    method: 'GET',
  });
  return data.permissions;
}
