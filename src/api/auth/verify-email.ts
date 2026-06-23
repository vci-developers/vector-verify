import type { NetworkError } from '@/lib/network/network-error';
import {
    verifyEmailRequestSchema,
    verifyEmailResponseSchema,
    type VerifyEmailRequestBody,
    type VerifyEmailResponseBody,
} from '@/api/auth/validation/verify-email-schema';
import { err, type Result } from '@/lib/result/result';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function verifyEmail(
    accessToken: string,
    requestBody: VerifyEmailRequestBody,
): Promise<Result<VerifyEmailResponseBody, NetworkError>> {
    const parsedRequestBody = verifyEmailRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<VerifyEmailResponseBody>(
        '/users/email/verify',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        verifyEmailResponseSchema,
    );
}
