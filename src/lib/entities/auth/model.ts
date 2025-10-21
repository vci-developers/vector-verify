import type { User } from '@/lib/entities/user';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  message: string;
  user: User;
  tokens: AuthTokens;
}
