import type { NetworkError } from '@/lib/network/network-error';
import {
    postVerifyEmailRequestSchema,
    postVerifyEmailResponseSchema,
    type PostVerifyEmailRequestBody,
    type PostVerifyEmailResponseBody,
} from '@/api/auth/validation/post-verify-email-schema';
import { err, type Result } from '@/lib/result/result';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postVerifyEmail(
    accessToken: string,
    requestBody: PostVerifyEmailRequestBody,
): Promise<Result<PostVerifyEmailResponseBody, NetworkError>> {
    const parsedRequestBody =
        postVerifyEmailRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<PostVerifyEmailResponseBody>(
        '/users/email/verify',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        postVerifyEmailResponseSchema,
    );
}
