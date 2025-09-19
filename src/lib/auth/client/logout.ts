'use client';

import { signOut } from 'next-auth/react';

export async function logoutAndRedirect(callbackUrl = '/login'): Promise<void> {
  await signOut({ callbackUrl });
}
