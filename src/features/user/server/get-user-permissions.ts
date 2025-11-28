import { upstreamFetch } from '@/shared/infra/http/server';
import { HttpError, parseApiErrorResponse } from '@/shared/infra/http/core';
import type {
  UserPermissionsResponseDto,
  UserPermissions,
} from '@/features/user/types';

export async function getServerUserPermissions(): Promise<UserPermissions> {
  const response = await upstreamFetch('users/permissions', { method: 'GET' });
  if (!response.ok) {
    const error = await parseApiErrorResponse(response);
    throw new HttpError(error.message, error.status, error.body);
  }
  const payload: UserPermissionsResponseDto = await response.json();
  return payload.permissions;
}
