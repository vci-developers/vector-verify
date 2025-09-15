'use server';

import { clearAuthCookies } from '@/lib/auth/cookies/server';

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
}
