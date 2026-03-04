import { signup } from '@/features/auth/api/signup';
import { setAccessCookie, setRefreshCookie } from '@/lib/auth-session/cookies';
import type {
    SignupRequestBody,
    SignupResponseBody,
    SignupSuccessPayload,
} from '@/features/auth/validation/network/signup-network-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    let requestBody: SignupRequestBody;

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

    const signupResult: Result<SignupResponseBody, NetworkError> =
        await signup(requestBody);
    if (!signupResult.ok) {
        return NextResponse.json(signupResult, {
            status: signupResult.error.status ?? 400,
        });
    }

    const successPayload: SignupSuccessPayload = {
        message: signupResult.data.message,
        user: signupResult.data.user,
    };

    const response = NextResponse.json(ok(successPayload), { status: 200 });

    setAccessCookie(response, signupResult.data.tokens.accessToken);
    setRefreshCookie(response, signupResult.data.tokens.refreshToken);
    return response;
}
