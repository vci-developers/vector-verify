import type { User } from '@/lib/domain/user';
import type { UserDto } from '@/lib/dto/user';

export function mapUserDtoToDomain(userDto: UserDto): User {
  const { id, email, privilege, isActive } = userDto;
  return { id, email, privilege, isActive };
}
