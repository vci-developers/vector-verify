import { clearAuthCookies } from '@/features/auth_new/lib/cookies';
import type { LogoutNetworkSuccessPayload } from '@/features/auth_new/validation/network/logout-network-schema';
import { ok } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST() {
    const successPayload: LogoutNetworkSuccessPayload = {
        message: 'Logged out successfully',
    };

    const response = NextResponse.json(ok(successPayload), { status: 200 });
    clearAuthCookies(response);
    return response;
}
