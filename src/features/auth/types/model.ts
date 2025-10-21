import type { User } from '@/features/user/types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  message: string;
  user: User;
  tokens: AuthTokens;
}
