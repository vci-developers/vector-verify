import { err, type Result } from '@/lib/result/result';
import {
    resolveConflictRequestSchema,
    resolveConflictResponseSchema,
    type ResolveConflictRequestBody,
    type ResolveConflictResponseBody,
} from './validation/resolve-conflict-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function resolveConflict(
    accessToken: string,
    requestBody: ResolveConflictRequestBody,
): Promise<Result<ResolveConflictResponseBody, NetworkError>> {
    const parsedRequestBody =
        resolveConflictRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<ResolveConflictResponseBody>(
        '/sessions/conflict/resolve',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        resolveConflictResponseSchema,
    );
}
