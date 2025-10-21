import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { ENV } from '@/lib/shared/config/env';
import type { LoginResponseDto, AuthTokens } from '@/features/auth/types';
import { mapAuthResponseDtoToPayload } from '@/features/auth/types';
import type { User as DomainUser } from '@/features/user/types';
import { loginToBackend } from '@/lib/auth/server/login';
import { refreshAccessToken } from '@/lib/auth/server/tokens';
import {
  ACCESS_FALLBACK_MS,
  REFRESH_BUFFER_MS,
  SESSION_MAX_AGE_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
  decodeJwtExp,
} from '@/lib/auth/server/tokens';

export const authOptions: NextAuthOptions = {
  secret: ENV.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  providers: [
    Credentials({
      name: 'Credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim();
        const password = String(credentials?.password ?? '');
        if (!email || !password) return null;

        const loginResponse: LoginResponseDto = await loginToBackend(email, password);
        const authPayload = mapAuthResponseDtoToPayload(loginResponse);
        const domainUser: DomainUser = authPayload.user;

        return {
          id: String(domainUser.id),
          email: domainUser.email,
          privilege: domainUser.privilege,
          isActive: domainUser.isActive,
          isWhitelisted: domainUser.isWhitelisted,
          accessToken: authPayload.tokens.accessToken,
          refreshToken: authPayload.tokens.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const rawUser = user as unknown as DomainUser & AuthTokens;

        const accessToken = rawUser.accessToken;
        const refreshToken = rawUser.refreshToken;
        const accessTokenExpires =
          decodeJwtExp(accessToken) ?? Date.now() + ACCESS_FALLBACK_MS;
        return {
          ...token,
          accessToken,
          refreshToken,
          accessTokenExpires: accessTokenExpires,
          user: {
            id: Number(rawUser.id),
            email: rawUser.email,
            privilege: rawUser.privilege,
            isActive: rawUser.isActive,
            isWhitelisted: rawUser.isWhitelisted,
          },
        };
      }

      const expires = token.accessTokenExpires as number | undefined;
      if (expires && Date.now() < expires - REFRESH_BUFFER_MS) {
        return token;
      }

      const refreshToken = token.refreshToken as string | undefined;
      if (!refreshToken) return token;
      try {
        const { accessToken: newAccessToken } = await refreshAccessToken(refreshToken);
        const newAccessTokenExpires =
          decodeJwtExp(newAccessToken) ?? Date.now() + ACCESS_FALLBACK_MS;
        return {
          ...token,
          accessToken: newAccessToken,
          accessTokenExpires: newAccessTokenExpires,
        };
      } catch {
        return { ...token, accessToken: undefined, accessTokenExpires: 0 };
      }
    },
  },
  pages: {
    signIn: '/login',
  },
};
