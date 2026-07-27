import { postVerify } from '@/api/user/post-verify';
import type {
    PostVerifyRequestBody,
    PostVerifyResponseBody,
} from '@/api/user/validation/post-verify-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { setVerifiedEmailCookie } from '@/lib/auth-session/cookies';

export async function POST(request: Request) {
    let requestBody: PostVerifyRequestBody;

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

    const postVerifyResult: Result<PostVerifyResponseBody, NetworkError> =
        await withAuthSession<PostVerifyResponseBody>(accessToken =>
            postVerify(accessToken, requestBody),
        );

    const response = NextResponse.json(postVerifyResult, {
        status: postVerifyResult.ok
            ? 200
            : (postVerifyResult.error.status ?? 400),
    });

    if (postVerifyResult.ok && postVerifyResult.data.user.emailVerified) {
        setVerifiedEmailCookie(response);
    }

    return response;
}
