import {
    refreshRequestSchema,
    refreshResponseSchema,
    type RefreshRequestBody,
    type RefreshResponseBody,
} from '@/features/auth_new/validation/network/refresh-network-schema';
import { safeApiCall } from '@/lib/network/safe-api-call';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';

export async function refresh(
    requestBody: RefreshRequestBody,
): Promise<Result<RefreshResponseBody, NetworkError>> {
    const parsedRequestBody = refreshRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<RefreshResponseBody>(
        '/auth/refresh',
        {
            method: 'POST',
            body: JSON.stringify(parsedRequestBody.data),
        },
        refreshResponseSchema,
    );
}
