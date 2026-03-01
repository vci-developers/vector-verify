import type { NetworkError } from '@/lib/network/network-error';
import {
    loginRequestSchema,
    loginResponseSchema,
    type LoginRequestBody,
    type LoginResponseBody,
} from '@/features/auth_new/validation/network/login-network-schema';
import { err, type Result } from '@/lib/result/result';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function login(
    requestBody: LoginRequestBody,
): Promise<Result<LoginResponseBody, NetworkError>> {
    const parsedRequestBody = loginRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<LoginResponseBody>(
        '/auth/login',
        {
            method: 'POST',
            body: JSON.stringify(parsedRequestBody.data),
        },
        loginResponseSchema,
    );
}
