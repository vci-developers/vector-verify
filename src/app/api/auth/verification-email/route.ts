import { sendVerificationEmail } from '@/api/auth/send-verification-email';
import { type VerificationEmailResponseBody } from '@/api/auth/validation/send-verification-email-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { NextResponse } from 'next/server';

export async function POST() {
    const sendVerificationEmailResult =
        await withAuthSession<VerificationEmailResponseBody>(
            sendVerificationEmail,
        );

    return NextResponse.json(sendVerificationEmailResult, {
        status: sendVerificationEmailResult.ok
            ? 200
            : (sendVerificationEmailResult.error.status ?? 400),
    });
}
