import {
    postResetPasswordRequestSchema,
    postResetPasswordResponseSchema,
    type PostResetPasswordRequestBody,
    type PostResetPasswordResponseBody,
} from '@/api/auth/validation/post-reset-password-schema';
import { safeApiCall } from '@/lib/network/safe-api-call';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';

export async function postResetPassword(
    requestBody: PostResetPasswordRequestBody,
): Promise<Result<PostResetPasswordResponseBody, NetworkError>> {
    const parsedRequestBody =
        postResetPasswordRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<PostResetPasswordResponseBody>(
        'auth/reset-password',
        {
            method: 'POST',
            body: JSON.stringify(parsedRequestBody.data),
        },
        postResetPasswordResponseSchema,
    );
}
