import {
    getUserActiveMetricsQueryParamsSchema,
    getUserActiveMetricsResponseSchema,
    type ActiveMetricSnapshot,
    type GetUserActiveMetricsResponseBody,
} from '@/api/user/validation/get-user-active-metrics-schema';
import {
    type GetAllUserActiveMetricsQueryParams,
    type GetAllUserActiveMetricsResponseBody,
} from '@/api/user/validation/get-all-user-active-metrics-schema';
import { ok, type Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

const LIMIT = 365;

export async function getAllUserActiveMetrics(
    accessToken: string,
    queryParams: GetAllUserActiveMetricsQueryParams,
): Promise<Result<GetAllUserActiveMetricsResponseBody, NetworkError>> {
    const allMetrics: ActiveMetricSnapshot[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const queryString = constructQueryString(
            { ...queryParams, limit: LIMIT, offset },
            getUserActiveMetricsQueryParamsSchema,
        );

        const result = await safeApiCall<GetUserActiveMetricsResponseBody>(
            `/users/active-metrics${queryString}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            getUserActiveMetricsResponseSchema,
        );

        if (!result.ok) return result;

        allMetrics.push(...result.data.metrics);
        hasMore = result.data.hasMore;
        offset += LIMIT;
    }

    return ok({
        message: `Retrieved ${allMetrics.length} active metrics successfully`,
        metrics: allMetrics,
    });
}
