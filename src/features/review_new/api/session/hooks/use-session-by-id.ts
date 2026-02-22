import { useQuery } from '@tanstack/react-query';
import { sessionKeys } from '@/features/review_new/api/session/session-keys';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import type { GetSessionByIdSuccessPayload } from '../validation/get-session-by-id-schema';

async function fetchSessionById(
    sessionId: number,
): Promise<Result<GetSessionByIdSuccessPayload, NetworkError>> {
    const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const sessionByIdResult: Result<
        GetSessionByIdSuccessPayload,
        NetworkError
    > = await response.json();
    return sessionByIdResult;
}

export function useSessionById(sessionId: number) {
    return useQuery({
        queryKey: sessionKeys.sessionById(sessionId),
        queryFn: () => fetchSessionById(sessionId),
    });
}
