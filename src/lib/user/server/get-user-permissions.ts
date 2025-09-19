import { upstreamFetch } from '@/lib/shared/http/server';
import {
  HttpError,
  parseApiErrorResponse,
} from '@/lib/shared/http/core';
import type { UserPermissionsResponseDto } from '@/lib/entities/user/dto';
import type { UserPermissions } from '@/lib/entities/user/permissions';

export async function getServerUserPermissions(): Promise<UserPermissions> {
  const response = await upstreamFetch('users/permissions', { method: 'GET' });
  if (!response.ok) {
    const error = await parseApiErrorResponse(response);
    throw new HttpError(error.message, error.status, error.body);
  }
  const payload: UserPermissionsResponseDto = await response.json();
  return payload.permissions;
}
