import { useMutation } from '@tanstack/react-query';
import type {
    ResolveSessionConflictsRequestBody,
    ResolveSessionConflictsSuccessPayload,
} from '@/api/session/validation/resolve-session-conflicts-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type ResolveSessionConflictsMutationResult = Result<
    ResolveSessionConflictsSuccessPayload,
    NetworkError
>;

async function submitSessionConflictsResolution(
    requestBody: ResolveSessionConflictsRequestBody,
): Promise<ResolveSessionConflictsMutationResult> {
    const response = await fetch('/api/sessions/conflicts/resolve', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result: ResolveSessionConflictsMutationResult = await response.json();
    return result;
}

export function useResolveSessionConflicts() {
    return useMutation({
        mutationFn: (requestBody: ResolveSessionConflictsRequestBody) =>
            submitSessionConflictsResolution(requestBody),
    });
}
