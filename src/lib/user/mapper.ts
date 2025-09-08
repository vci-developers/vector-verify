import type { User } from '@/lib/user/model';
import type { UserDto } from '@/lib/user/dto';

export function mapUserDtoToDomain(userDto: UserDto): User {
  const { id, email, privilege, isActive, isWhitelisted } = userDto;
  return { id, email, privilege, isActive, isWhitelisted };
}

