import {
    resetPasswordRequestSchema,
    resetPasswordResponseSchema,
    type ResetPasswordRequestBody,
    type ResetPasswordResponseBody,
} from '@/api/auth/validation/reset-password-schema';
import { safeApiCall } from '@/lib/network/safe-api-call';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';

export async function resetPassword(
    requestBody: ResetPasswordRequestBody,
): Promise<Result<ResetPasswordResponseBody, NetworkError>> {
    const parsedRequestBody = resetPasswordRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<ResetPasswordResponseBody>(
        'auth/reset-password',
        {
            method: 'POST',
            body: JSON.stringify(parsedRequestBody.data),
        },
        resetPasswordResponseSchema,
    );
}
