import bff from '@/lib/shared/http/client/bff-client';
import type { UserPermissionsResponseDto } from '@/lib/entities/user/dto';
import type { UserPermissions } from '@/lib/entities/user/permissions';

export async function getUserPermissions(): Promise<UserPermissions> {
  const data = await bff<UserPermissionsResponseDto>('users/permissions', {
    method: 'GET',
  });
  return data.permissions;
}
