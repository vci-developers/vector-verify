import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    UpdateSessionRequestBody,
    UpdateSessionSuccessPayload,
} from '@/api/session/validation/update-session-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { sessionKeys } from '@/api/session/session-keys';

type UpdateSessionMutationResult = Result<
    UpdateSessionSuccessPayload,
    NetworkError
>;

async function fetchUpdateSession(
    sessionId: number,
    requestBody: UpdateSessionRequestBody,
): Promise<UpdateSessionMutationResult> {
    const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const updateSessionResult: UpdateSessionMutationResult =
        await response.json();
    return updateSessionResult;
}

export function useUpdateSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            sessionId,
            requestBody,
        }: {
            sessionId: number;
            requestBody: UpdateSessionRequestBody;
        }) => fetchUpdateSession(sessionId, requestBody),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: sessionKeys.root });
        },
    });
}
