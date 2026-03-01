import type { Result } from '@/lib/result/result';
import {
    getSessionsQueryParamsSchema,
    type GetSessionsQueryParams,
    type GetSessionsSuccessPayload,
} from '@/api/session/validation/get-sessions-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { sessionKeys } from '@/api/session/session-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';

type SessionsQueryResult = Result<GetSessionsSuccessPayload, NetworkError>;

type SessionsQueryOptions = Omit<
    UseQueryOptions<SessionsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSessions(
    queryParams?: GetSessionsQueryParams,
): Promise<SessionsQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getSessionsQueryParamsSchema,
    );

    const response = await fetch(`/api/sessions${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const sessionsResult: SessionsQueryResult = await response.json();
    return sessionsResult;
}

export function useSessions(
    queryParams?: GetSessionsQueryParams,
    options?: SessionsQueryOptions,
) {
    return useQuery({
        queryKey: sessionKeys.sessions(queryParams),
        queryFn: () => fetchSessions(queryParams),
        ...options,
    });
}
