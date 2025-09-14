import { upstreamFetch } from '@/lib/shared/http/server';
import { parseApiError } from '@/lib/shared/http/core/parse-api-error';
import { HttpError } from '@/lib/shared/http/core/http-error';
import type { UserProfileResponseDto } from '@/lib/user/dto';
import type { User } from '@/lib/user/model';
import { mapUserDtoToDomain } from '@/lib/user/mapper';

export async function getServerUserProfile(): Promise<User> {
  const response = await upstreamFetch('users/profile', { method: 'GET' });
  if (!response.ok) {
    const message = await parseApiError(response);
    throw new HttpError(message, response.status);
  }
  const payload: UserProfileResponseDto = await response.json();
  return mapUserDtoToDomain(payload.user);
}
