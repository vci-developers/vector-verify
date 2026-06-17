import type { NetworkError } from '@/lib/network/network-error';
import {
    forgotPasswordRequestSchema,
    forgotPasswordResponseSchema,
    type ForgotPasswordRequestBody,
    type ForgotPasswordResponseBody,
} from '@/api/auth/validation/forgot-password-schema';
import { err, type Result } from '@/lib/result/result';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function sendForgotPassword(
    requestBody: ForgotPasswordRequestBody,
): Promise<Result<ForgotPasswordResponseBody, NetworkError>> {
    const parsedRequestBody =
        forgotPasswordRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<ForgotPasswordResponseBody>(
        '/auth/forgot-password',
        {
            method: 'POST',
            body: JSON.stringify(parsedRequestBody.data),
        },
        forgotPasswordResponseSchema,
    );
}
