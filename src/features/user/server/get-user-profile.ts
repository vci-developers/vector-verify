import { upstreamFetch } from '@/shared/infra/http/server';
import { HttpError, parseApiErrorResponse } from '@/shared/infra/http/core';
import type { UserProfileResponseDto, User } from '@/features/user/types';
import { mapUserDtoToModel } from '@/features/user/types';

export async function getServerUserProfile(): Promise<User> {
  const response = await upstreamFetch('users/profile', { method: 'GET' });
  if (!response.ok) {
    const error = await parseApiErrorResponse(response);
    throw new HttpError(error.message, error.status, error.body);
  }
  const payload: UserProfileResponseDto = await response.json();
  return mapUserDtoToModel(payload.user);
}
