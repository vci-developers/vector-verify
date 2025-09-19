const NODE_ENV = process.env.NODE_ENV ?? 'development';

let NEXTAUTH_SECRET: string | undefined = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET) {
  if (NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET environment variable is required in production');
  }
  NEXTAUTH_SECRET = 'development-nextauth-secret';
}

export const ENV = {
  API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3000',
  NEXTAUTH_SECRET,
  NODE_ENV,
} as const;
