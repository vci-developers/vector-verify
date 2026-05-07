import { useMutation } from '@tanstack/react-query';
import type {
    ResolveConflictRequestBody,
    ResolveConflictSuccessPayload,
} from '@/api/session/validation/resolve-conflict-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type ResolveConflictMutationResult = Result<
    ResolveConflictSuccessPayload,
    NetworkError
>;

async function submitConflictResolution(
    requestBody: ResolveConflictRequestBody,
): Promise<ResolveConflictMutationResult> {
    const response = await fetch('/api/sessions/conflict/resolve', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result: ResolveConflictMutationResult = await response.json();
    return result;
}

export function usePostResolveConflict() {
    return useMutation({
        mutationFn: (requestBody: ResolveConflictRequestBody) =>
            submitConflictResolution(requestBody),
    });
}
