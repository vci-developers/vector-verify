'use server';

import { clearAuthCookies } from '@/lib/auth-session/cookies';
import { redirect } from 'next/navigation';

export async function logout() {
    await clearAuthCookies();
    window.localStorage.clear();
    redirect('/login');
}
