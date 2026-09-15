import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import {
    getUserAuthEventsQueryParamsSchema,
    type GetUserAuthEventsQueryParams,
    type GetUserAuthEventsSuccessPayload,
} from '@/api/user/validation/get-user-auth-events-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetUserAuthEventsQueryResult = Result<
    GetUserAuthEventsSuccessPayload,
    NetworkError
>;
type GetUserAuthEventsQueryOptions = Omit<
    UseQueryOptions<GetUserAuthEventsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchUserAuthEvents(
    queryParams: GetUserAuthEventsQueryParams,
): Promise<GetUserAuthEventsQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getUserAuthEventsQueryParamsSchema,
    );

    const response = await fetch(`/api/users/auth-events${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    const getUserAuthEventsResult: GetUserAuthEventsQueryResult =
        await response.json();
    return getUserAuthEventsResult;
}

export function useGetUserAuthEvents(
    queryParams: GetUserAuthEventsQueryParams,
    options?: GetUserAuthEventsQueryOptions,
) {
    return useQuery({
        queryKey: userKeys.authEvents(queryParams),
        queryFn: () => fetchUserAuthEvents(queryParams),
        ...options,
    });
}
