import { upstreamFetch } from '@/lib/shared/http/server';
import {
  HttpError,
  parseApiErrorResponse,
} from '@/lib/shared/http/core';
import type { UserProfileResponseDto } from '@/lib/entities/user/dto';
import type { User } from '@/lib/entities/user/model';
import { mapUserDtoToDomain } from '@/lib/entities/user/mapper';

export async function getServerUserProfile(): Promise<User> {
  const response = await upstreamFetch('users/profile', { method: 'GET' });
  if (!response.ok) {
    const error = await parseApiErrorResponse(response);
    throw new HttpError(error.message, error.status, error.body);
  }
  const payload: UserProfileResponseDto = await response.json();
  return mapUserDtoToDomain(payload.user);
}
