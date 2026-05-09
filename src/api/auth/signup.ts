import {
    signupRequestSchema,
    signupResponseSchema,
    type SignupRequestBody,
    type SignupResponseBody,
} from '@/api/auth/validation/signup-schema';
import { safeApiCall } from '@/lib/network/safe-api-call';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';

export async function signup(
    requestBody: SignupRequestBody,
): Promise<Result<SignupResponseBody, NetworkError>> {
    const parsedRequestBody = signupRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<SignupResponseBody>(
        '/auth/signup',
        {
            method: 'POST',
            body: JSON.stringify(parsedRequestBody.data),
        },
        signupResponseSchema,
    );
}
