export const ENV = {
  API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'defaultsecret',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
