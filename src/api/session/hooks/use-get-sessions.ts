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

type GetSessionsQueryResult = Result<GetSessionsSuccessPayload, NetworkError>;

type GetSessionsQueryOptions = Omit<
    UseQueryOptions<GetSessionsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

export async function fetchSessions(
    queryParams?: GetSessionsQueryParams,
): Promise<GetSessionsQueryResult> {
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

    const getSessionsResult: GetSessionsQueryResult = await response.json();
    return getSessionsResult;
}

export function useGetSessions(
    queryParams?: GetSessionsQueryParams,
    options?: GetSessionsQueryOptions,
) {
    return useQuery({
        queryKey: sessionKeys.sessions(queryParams),
        queryFn: () => fetchSessions(queryParams),
        ...options,
    });
}
