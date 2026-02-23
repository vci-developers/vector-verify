'use server';

import { clearAuthCookies } from '@/features/auth_new/lib/cookies';
import { redirect } from 'next/navigation';

export async function logout() {
    await clearAuthCookies();
    redirect('/login_new');
}
