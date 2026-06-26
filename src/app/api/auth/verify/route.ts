import { postVerifyEmail } from '@/api/auth/post-verify-email';
import type {
    PostVerifyEmailRequestBody,
    PostVerifyEmailResponseBody,
} from '@/api/auth/validation/post-verify-email-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { setVerifiedEmailCookie } from '@/lib/auth-session/cookies';

export async function POST(request: Request) {
    let requestBody: PostVerifyEmailRequestBody;

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

    const postVerifyEmailResult: Result<
        PostVerifyEmailResponseBody,
        NetworkError
    > = await withAuthSession<PostVerifyEmailResponseBody>(accessToken =>
        postVerifyEmail(accessToken, requestBody),
    );

    const response = NextResponse.json(postVerifyEmailResult, {
        status: postVerifyEmailResult.ok
            ? 200
            : (postVerifyEmailResult.error.status ?? 400),
    });

    if (
        postVerifyEmailResult.ok &&
        postVerifyEmailResult.data.user.emailVerified
    ) {
        setVerifiedEmailCookie(response);
    }

    return response;
}
