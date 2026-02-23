import type { NetworkError } from '@/lib/network/network-error';
import {
    getSessionsQueryParamsSchema,
    getSessionsSchema,
    type GetSessionsQueryParams,
    type GetSessionsResponseBody,
} from '@/api/session/validation/get-sessions-schema';
import type { Result } from '@/lib/result/result';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getSessions(
    accessToken: string,
    queryParams?: GetSessionsQueryParams,
): Promise<Result<GetSessionsResponseBody, NetworkError>> {
    const queryString = constructQueryString<GetSessionsQueryParams>(
        queryParams,
        getSessionsQueryParamsSchema,
    );

    return safeApiCall<GetSessionsResponseBody>(
        `/sessions${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getSessionsSchema,
    );
}
