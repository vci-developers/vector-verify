import {
    getUsersQueryParamsSchema,
    getUsersResponseSchema,
    type GetUsersQueryParams,
    type GetUsersResponseBody,
} from '@/api/user/validation/get-users-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getUsers(
    accessToken: string,
    queryParams: GetUsersQueryParams,
): Promise<Result<GetUsersResponseBody, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        getUsersQueryParamsSchema,
    );

    return safeApiCall<GetUsersResponseBody>(
        `/users/${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getUsersResponseSchema,
    );
}
