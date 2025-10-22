import NextAuth from 'next-auth';
import { authOptions } from '@/features/auth/server';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export const runtime = 'nodejs';
