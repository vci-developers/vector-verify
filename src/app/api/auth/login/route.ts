import { login } from '@/api/auth/login';
import { setAccessCookie, setRefreshCookie } from '@/lib/auth-session/cookies';
import type {
    LoginRequestBody,
    LoginResponseBody,
    LoginSuccessPayload,
} from '@/api/auth/validation/login-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    let requestBody: LoginRequestBody;

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

    const loginResult: Result<LoginResponseBody, NetworkError> =
        await login(requestBody);
    if (!loginResult.ok) {
        return NextResponse.json(loginResult, {
            status: loginResult.error.status ?? 400,
        });
    }

    const successPayload: LoginSuccessPayload = {
        message: loginResult.data.message,
        user: loginResult.data.user,
    };

    const response = NextResponse.json(ok(successPayload), { status: 200 });

    setAccessCookie(response, loginResult.data.tokens.accessToken);
    setRefreshCookie(response, loginResult.data.tokens.refreshToken);
    return response;
}
