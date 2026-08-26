import { postSendVerification } from '@/api/user/post-send-verification';
import { type PostSendVerificationResponseBody } from '@/api/user/validation/post-send-verification-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function POST() {
    const postSendVerificationResult =
        await withAuthSession<PostSendVerificationResponseBody>(
            postSendVerification,
        );

    return NextResponse.json(postSendVerificationResult, {
        status: postSendVerificationResult.ok
            ? 200
            : (postSendVerificationResult.error.status ?? 400),
    });
}
