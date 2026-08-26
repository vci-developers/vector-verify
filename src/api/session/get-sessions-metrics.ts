import {
    getSessionsMetricsQueryParamsSchema,
    getSessionsMetricsResponseSchema,
    type GetSessionsMetricsQueryParams,
    type GetSessionsMetricsResponseBody,
} from '@/api/session/validation/get-sessions-metrics-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getSessionsMetrics(
    accessToken: string,
    queryParams: GetSessionsMetricsQueryParams,
): Promise<Result<GetSessionsMetricsResponseBody, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        getSessionsMetricsQueryParamsSchema,
    );

    return safeApiCall<GetSessionsMetricsResponseBody>(
        `/sessions/metrics${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getSessionsMetricsResponseSchema,
    );
}
