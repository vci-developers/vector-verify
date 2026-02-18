import {
    signupRequestSchema,
    signupResponseSchema,
    type SignupNetworkRequestBody,
    type SignupNetworkResponseBody,
} from '@/features/auth_new/validation/network/signup-network-schema';
import { safeApiCall } from '@/lib/network/client';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';

export async function signup(
    requestBody: SignupNetworkRequestBody,
): Promise<Result<SignupNetworkResponseBody, NetworkError>> {
    const parsedRequestBody = signupRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<SignupNetworkResponseBody>(
        '/auth/signup',
        {
            method: 'POST',
            body: JSON.stringify(parsedRequestBody.data),
        },
        signupResponseSchema,
    );
}
