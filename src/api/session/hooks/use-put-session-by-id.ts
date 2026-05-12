import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    PutSessionByIdRequestBody,
    PutSessionByIdSuccessPayload,
} from '@/api/session/validation/put-session-by-id-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { sessionKeys } from '@/api/session/session-keys';

type PutSessionByIdMutationResult = Result<
    PutSessionByIdSuccessPayload,
    NetworkError
>;

async function updateSessionById(
    sessionId: number,
    requestBody: PutSessionByIdRequestBody,
): Promise<PutSessionByIdMutationResult> {
    const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const putSessionByIdResult: PutSessionByIdMutationResult =
        await response.json();
    return putSessionByIdResult;
}

export function usePutSessionById() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            sessionId,
            requestBody,
        }: {
            sessionId: number;
            requestBody: PutSessionByIdRequestBody;
        }) => updateSessionById(sessionId, requestBody),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sessionKeys.root });
        },
    });
}
