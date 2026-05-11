import { err, type Result } from '@/lib/result/result';
import {
    resolveSessionConflictsRequestSchema,
    resolveSessionConflictsResponseSchema,
    type ResolveSessionConflictsRequestBody,
    type ResolveSessionConflictsResponseBody,
} from './validation/resolve-session-conflicts-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function resolveSessionConflicts(
    accessToken: string,
    requestBody: ResolveSessionConflictsRequestBody,
): Promise<Result<ResolveSessionConflictsResponseBody, NetworkError>> {
    const parsedRequestBody =
        resolveSessionConflictsRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<ResolveSessionConflictsResponseBody>(
        '/sessions/conflicts/resolve',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        resolveSessionConflictsResponseSchema,
    );
}
