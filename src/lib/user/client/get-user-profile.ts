import bff from '@/lib/shared/http/client/bff-client';
import type { UserProfileResponseDto } from '@/lib/entities/user/dto';
import type { User } from '@/lib/entities/user/model';
import { mapUserDtoToDomain } from '@/lib/entities/user/mapper';

export async function getUserProfile(): Promise<User> {
  const data = await bff<UserProfileResponseDto>('users/profile', {
    method: 'GET',
  });
  return mapUserDtoToDomain(data.user);
}
