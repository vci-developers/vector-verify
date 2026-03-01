import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { sessionKeys } from '@/api/session/session-keys';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import type { GetSessionByIdSuccessPayload } from '../validation/get-session-by-id-schema';

type SessionByIdQueryResult = Result<
    GetSessionByIdSuccessPayload,
    NetworkError
>;

type SessionByIdQueryOptions = Omit<
    UseQueryOptions<SessionByIdQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

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

    const sessionByIdResult: SessionByIdQueryResult = await response.json();
    return sessionByIdResult;
}

export function useSessionById(
    sessionId: number,
    options?: SessionByIdQueryOptions,
) {
    return useQuery({
        queryKey: sessionKeys.sessionById(sessionId),
        queryFn: () => fetchSessionById(sessionId),
        ...options,
    });
}
