import { AuthTokens } from '@/lib/auth/types';
import { UserDto } from '@/lib/dto/user';

export interface LoginRequestDto {
  email: string;
  password: string;
}
export interface LoginResponseDto {
  message: string;
  user: UserDto;
  tokens: AuthTokens;
}

export interface SignupRequestDto {
  email: string;
  password: string;
}
export interface SignupResponseDto {
  message: string;
  user: UserDto;
  tokens: AuthTokens;
}

export interface RefreshRequestDto {
  refreshToken: string;
}
export interface RefreshResponseDto {
  message: string;
  accessToken: string;
}
