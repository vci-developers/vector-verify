'use server';

import { clearAuthCookies } from '@/lib/auth-session/cookies';
import { redirect } from 'next/navigation';

export async function logout() {
    await clearAuthCookies();
    redirect('/login');
}
