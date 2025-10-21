import bff from '@/lib/api/bff-client';
import type { UserProfileResponseDto } from '@/features/user/types';
import type { User } from '@/features/user/types';
import { mapUserDtoToModel } from '@/features/user/types';

export async function getUserProfile(): Promise<User> {
  const data = await bff<UserProfileResponseDto>('users/profile', {
    method: 'GET',
  });
  return mapUserDtoToModel(data.user);
}
