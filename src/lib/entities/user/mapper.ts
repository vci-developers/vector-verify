import type { UserDto } from './dto';
import type { User } from './model';

export function mapUserDtoToModel(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    privilege: dto.privilege,
    isActive: dto.isActive,
    isWhitelisted: dto.isWhitelisted,
  };
}
