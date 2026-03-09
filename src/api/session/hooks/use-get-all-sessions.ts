import {
    getAllSessionsQueryParamsSchema,
    type GetAllSessionsQueryParams,
    type GetAllSessionsSuccessPayload,
} from '@/api/session/validation/get-all-sessions-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { sessionKeys } from '@/api/session/session-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { Result } from '@/lib/result/result';

type GetAllSessionsQueryResult = Result<
    GetAllSessionsSuccessPayload,
    NetworkError
>;

type GetAllSessionsQueryOptions = Omit<
    UseQueryOptions<GetAllSessionsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAllSessions(
    queryParams: GetAllSessionsQueryParams,
): Promise<GetAllSessionsQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getAllSessionsQueryParamsSchema,
    );

    const response = await fetch(`/api/sessions/all${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const result: GetAllSessionsQueryResult = await response.json();
    return result;
}

export function useGetAllSessions(
    queryParams: GetAllSessionsQueryParams,
    options?: GetAllSessionsQueryOptions,
) {
    return useQuery({
        queryKey: sessionKeys.allSessions(queryParams),
        queryFn: () => fetchAllSessions(queryParams),
        ...options,
    });
}
