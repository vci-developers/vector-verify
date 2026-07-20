import { postSendEmailVerification } from '@/api/auth/post-send-email-verification';
import { type PostSendEmailVerificationResponseBody } from '@/api/auth/validation/post-send-email-verification-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function POST() {
    const postSendEmailVerificationResult =
        await withAuthSession<PostSendEmailVerificationResponseBody>(
            postSendEmailVerification,
        );

    return NextResponse.json(postSendEmailVerificationResult, {
        status: postSendEmailVerificationResult.ok
            ? 200
            : (postSendEmailVerificationResult.error.status ?? 400),
    });
}
