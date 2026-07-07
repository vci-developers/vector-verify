import type { NetworkError } from '@/lib/network/network-error';
import {
    getUserActiveMetricsQueryParamsSchema,
    getUserActiveMetricsResponseSchema,
    type GetUserActiveMetricsQueryParams,
    type GetUserActiveMetricsResponseBody,
} from '@/api/user/validation/get-user-active-metrics-schema';
import type { Result } from '@/lib/result/result';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getUserActiveMetrics(
    accessToken: string,
    queryParams?: GetUserActiveMetricsQueryParams,
): Promise<Result<GetUserActiveMetricsResponseBody, NetworkError>> {
    const queryString = constructQueryString<GetUserActiveMetricsQueryParams>(
        queryParams,
        getUserActiveMetricsQueryParamsSchema,
    );

    return safeApiCall<GetUserActiveMetricsResponseBody>(
        `/users/active-metrics${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getUserActiveMetricsResponseSchema,
    );
}
