import type { NetworkError } from '@/lib/network/network-error';
import {
    postVerifyRequestSchema,
    postVerifyResponseSchema,
    type PostVerifyRequestBody,
    type PostVerifyResponseBody,
} from '@/api/user/validation/post-verify-schema';
import { err, type Result } from '@/lib/result/result';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postVerify(
    accessToken: string,
    requestBody: PostVerifyRequestBody,
): Promise<Result<PostVerifyResponseBody, NetworkError>> {
    const parsedRequestBody = postVerifyRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<PostVerifyResponseBody>(
        '/users/email/verify',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        postVerifyResponseSchema,
    );
}
