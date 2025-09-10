import { bff } from '@/lib/http/client';
import type { UserProfileResponseDto } from '@/lib/user/dto';
import type { User } from '@/lib/user/model';
import { mapUserDtoToDomain } from '@/lib/user/mapper';

export async function getUserProfile(): Promise<User> {
  const data = await bff<UserProfileResponseDto>('users/profile', { method: 'GET' });
  return mapUserDtoToDomain(data.user);
}
