import {
    getUserAuthEventsQueryParamsSchema,
    getUserAuthEventsResponseSchema,
    type GetUserAuthEventsQueryParams,
    type GetUserAuthEventsResponseBody,
} from '@/api/user/validation/get-user-auth-events-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getUserAuthEvents(
    accessToken: string,
    queryParams: GetUserAuthEventsQueryParams,
): Promise<Result<GetUserAuthEventsResponseBody, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        getUserAuthEventsQueryParamsSchema,
    );

    return safeApiCall<GetUserAuthEventsResponseBody>(
        `/users/auth-events${queryString}`,
        {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        getUserAuthEventsResponseSchema,
    );
}
