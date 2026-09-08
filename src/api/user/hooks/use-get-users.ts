import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import {
    getUsersQueryParamsSchema,
    type GetUsersQueryParams,
    type GetUsersSuccessPayload,
} from '@/api/user/validation/get-users-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetUsersQueryResult = Result<GetUsersSuccessPayload, NetworkError>;

type GetUsersQueryOptions = Omit<
    UseQueryOptions<GetUsersQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchUsers(
    queryParams: GetUsersQueryParams,
): Promise<GetUsersQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getUsersQueryParamsSchema,
    );

    const response = await fetch(`/api/users${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getUsersResult: GetUsersQueryResult = await response.json();
    return getUsersResult;
}

export function useGetUsers(
    queryParams: GetUsersQueryParams,
    options?: GetUsersQueryOptions,
) {
    return useQuery({
        queryKey: userKeys.users(queryParams),
        queryFn: () => fetchUsers(queryParams),
        ...options,
    });
}
