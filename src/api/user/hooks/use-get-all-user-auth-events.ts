import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import {
    getAllUserAuthEventsQueryParamsSchema,
    type GetAllUserAuthEventsQueryParams,
    type GetAllUserAuthEventsSuccessPayload,
} from '@/api/user/validation/get-all-user-auth-events-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetAllUserAuthEventsQueryResult = Result<
    GetAllUserAuthEventsSuccessPayload,
    NetworkError
>;

type GetAllUserAuthEventsQueryOptions = Omit<
    UseQueryOptions<GetAllUserAuthEventsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAllUserAuthEvents(
    queryParams: GetAllUserAuthEventsQueryParams,
): Promise<GetAllUserAuthEventsQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getAllUserAuthEventsQueryParamsSchema,
    );

    const response = await fetch(`/api/users/auth-events/all${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getAllUserAuthEventsResult: GetAllUserAuthEventsQueryResult =
        await response.json();
    return getAllUserAuthEventsResult;
}

export function useGetAllUserAuthEvents(
    queryParams: GetAllUserAuthEventsQueryParams,
    options?: GetAllUserAuthEventsQueryOptions,
) {
    return useQuery({
        queryKey: userKeys.allAuthEvents(queryParams),
        queryFn: () => fetchAllUserAuthEvents(queryParams),
        ...options,
    });
}
