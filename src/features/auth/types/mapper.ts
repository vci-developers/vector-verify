import type { LoginResponseDto, SignupResponseDto } from './dto';
import type { AuthPayload } from './model';
import { mapUserDtoToModel } from '@/features/user/types';

export function mapAuthResponseDtoToPayload(
  dto: LoginResponseDto | SignupResponseDto,
): AuthPayload {
  return {
    message: dto.message,
    user: mapUserDtoToModel(dto.user),
    tokens: dto.tokens,
  };
}
