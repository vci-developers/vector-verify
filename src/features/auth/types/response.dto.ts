import type { UserDto } from '@/shared/entities/user';
import type { AuthTokens } from '@/shared/entities/auth';

export interface LoginResponseDto {
  message: string;
  user: UserDto;
  tokens: AuthTokens;
}

export interface SignupResponseDto {
  message: string;
  user: UserDto;
  tokens: AuthTokens;
}

export interface RefreshResponseDto {
  message: string;
  accessToken: string;
}
