import type { UserDto } from '@/lib/entities/user';
import type { AuthTokens } from '@/lib/entities/auth';

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
