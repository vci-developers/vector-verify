import { upstreamFetch } from '@/lib/shared/http/server';
import { parseApiError } from '@/lib/shared/http/core/parse-api-error';
import { HttpError } from '@/lib/shared/http/core/http-error';
import type { UserPermissionsResponseDto } from '@/lib/entities/user/dto';
import type { UserPermissions } from '@/lib/entities/user/permissions';

export async function getServerUserPermissions(): Promise<UserPermissions> {
  const response = await upstreamFetch('users/permissions', { method: 'GET' });
  if (!response.ok) {
    const message = await parseApiError(response);
    throw new HttpError(message, response.status);
  }
  const payload: UserPermissionsResponseDto = await response.json();
  return payload.permissions;
}
