import { type Result } from '@/lib/result/result';
import {
    postSendVerificationResponseSchema,
    type PostSendVerificationResponseBody,
} from '@/api/user/validation/post-send-verification-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postSendVerification(
    accessToken: string,
): Promise<Result<PostSendVerificationResponseBody, NetworkError>> {
    return safeApiCall<PostSendVerificationResponseBody>(
        '/users/email/send-verification',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        postSendVerificationResponseSchema,
    );
}
