import type { NetworkError } from '@/lib/network/network-error';
import {
    postForgotPasswordRequestSchema,
    postForgotPasswordResponseSchema,
    type PostForgotPasswordRequestBody,
    type PostForgotPasswordResponseBody,
} from '@/api/auth/validation/post-forgot-password-schema';
import { err, type Result } from '@/lib/result/result';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postForgotPassword(
    requestBody: PostForgotPasswordRequestBody,
): Promise<Result<PostForgotPasswordResponseBody, NetworkError>> {
    const parsedRequestBody =
        postForgotPasswordRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<PostForgotPasswordResponseBody>(
        '/auth/forgot-password',
        {
            method: 'POST',
            body: JSON.stringify(parsedRequestBody.data),
        },
        postForgotPasswordResponseSchema,
    );
}
