import { useMutation } from '@tanstack/react-query';
import type {
    PutSessionRequestBody,
    PutSessionSuccessPayload,
} from '@/api/session/validation/put-session-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type PutSessionMutationResult = Result<PutSessionSuccessPayload, NetworkError>;

type PutSessionVariables = {
    sessionId: number;
    requestBody: PutSessionRequestBody;
};

async function updateSession(
    sessionId: number,
    requestBody: PutSessionRequestBody,
): Promise<PutSessionMutationResult> {
    const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const putSessionResult: PutSessionMutationResult = await response.json();
    return putSessionResult;
}

export function usePutSession() {
    return useMutation({
        mutationFn: ({ sessionId, requestBody }: PutSessionVariables) =>
            updateSession(sessionId, requestBody),
    });
}
