import { type Result } from '@/lib/result/result';
import {
    verificationEmailResponseSchema,
    type VerificationEmailResponseBody,
} from '@/api/auth/validation/send-verification-email-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function sendVerificationEmail(
    accessToken: string,
): Promise<Result<VerificationEmailResponseBody, NetworkError>> {
    return safeApiCall<VerificationEmailResponseBody>(
        '/users/email/send-verification',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        verificationEmailResponseSchema,
    );
}
