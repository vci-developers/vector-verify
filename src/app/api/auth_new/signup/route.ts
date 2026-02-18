import { signup } from '@/features/auth_new/api/signup';
import {
    setAccessCookie,
    setRefreshCookie,
} from '@/features/auth_new/lib/cookies';
import type { SignupNetworkRequestBody } from '@/features/auth_new/validation/network/signup-network-schema';
import { err, ok } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    let requestBody: SignupNetworkRequestBody;

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

    const signupResult = await signup(requestBody);
    if (!signupResult.ok) {
        return NextResponse.json(signupResult, {
            status: signupResult.error.status ?? 400,
        });
    }

    const response = NextResponse.json(
        ok({
            message: signupResult.data.message,
            user: signupResult.data.user,
        }),
        { status: 200 },
    );

    setAccessCookie(response, signupResult.data.tokens.accessToken);
    setRefreshCookie(response, signupResult.data.tokens.refreshToken);
    return response;
}
