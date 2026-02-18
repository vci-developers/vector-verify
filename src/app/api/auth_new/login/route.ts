import { login } from '@/features/auth_new/api/login';
import {
    setAccessCookie,
    setRefreshCookie,
} from '@/features/auth_new/lib/cookies';
import type { LoginNetworkRequestBody } from '@/features/auth_new/validation/network/login-network-schema';
import { err, ok } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    let requestBody: LoginNetworkRequestBody;

    try {
        requestBody = await request.json();
    } catch {
        const requestBodyErrorResult = err({
            kind: 'client',
            status: 400,
            message: 'Invalid JSON body',
        });
        return NextResponse.json(requestBodyErrorResult, { status: 400 });
    }

    const loginResult = await login(requestBody);
    if (!loginResult.ok) {
        return NextResponse.json(loginResult, {
            status: loginResult.error.status ?? 400,
        });
    }

    const response = NextResponse.json(
        ok({
            message: loginResult.data.message,
            user: loginResult.data.user,
        }),
        { status: 200 },
    );

    setAccessCookie(response, loginResult.data.tokens.accessToken);
    setRefreshCookie(response, loginResult.data.tokens.refreshToken);
    return response;
}
