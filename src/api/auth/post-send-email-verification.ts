import { type Result } from '@/lib/result/result';
import {
    postSendEmailVerificationResponseSchema,
    type PostSendEmailVerificationResponseBody,
} from '@/api/auth/validation/post-send-email-verification-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postSendVerificationEmail(
    accessToken: string,
): Promise<Result<PostSendEmailVerificationResponseBody, NetworkError>> {
    return safeApiCall<PostSendEmailVerificationResponseBody>(
        '/users/email/send-verification',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        postSendEmailVerificationResponseSchema,
    );
}
