import { clearAuthCookies } from '@/features/auth_new/lib/cookies';
import { ok } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json(
        ok({ message: 'Logged out successfully' }),
        { status: 200 },
    );
    clearAuthCookies(response);
    return response;
}
