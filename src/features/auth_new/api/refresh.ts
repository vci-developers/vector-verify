import {
    refreshRequestSchema,
    refreshResponseSchema,
    type RefreshNetworkRequestBody,
    type RefreshNetworkResponseBody,
} from '@/features/auth_new/validation/network/refresh-network-schema';
import { safeApiCall } from '@/lib/network/client';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';

export async function refresh(
    requestBody: RefreshNetworkRequestBody,
): Promise<Result<RefreshNetworkResponseBody, NetworkError>> {
    const parsedRequestBody = refreshRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<RefreshNetworkResponseBody>(
        '/auth/refresh',
        {
            method: 'POST',
            body: JSON.stringify(parsedRequestBody.data),
        },
        refreshResponseSchema,
    );
}
