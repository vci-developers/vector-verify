import { verifyEmail } from '@/api/auth/verify-email';
import type {
    VerifyEmailRequestBody,
    VerifyEmailResponseBody,
} from '@/api/auth/validation/verify-email-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { setVerifiedEmailCookie } from '@/lib/auth-session/cookies';

export async function POST(request: Request) {
    let requestBody: VerifyEmailRequestBody;

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

    const verifyEmailResult: Result<VerifyEmailResponseBody, NetworkError> =
        await withAuthSession<VerifyEmailResponseBody>(accessToken =>
            verifyEmail(accessToken, requestBody),
        );

    const response = NextResponse.json(verifyEmailResult, {
        status: verifyEmailResult.ok
            ? 200
            : (verifyEmailResult.error.status ?? 400),
    });

    if (verifyEmailResult.ok && verifyEmailResult.data.user.emailVerified) {
        setVerifiedEmailCookie(response);
    }

    return response;
}
