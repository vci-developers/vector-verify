import type { Result } from '@/lib/result/result';
import {
    getSessionsMetricsQueryParamsSchema,
    type GetSessionsMetricsQueryParams,
    type GetSessionsMetricsResponseBody,
} from '@/api/session/validation/get-sessions-metrics-schema';
import type { NetworkError } from '@/lib/network/network-error';
import {
    useQueries,
    useQuery,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { sessionKeys } from '@/api/session/session-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetSessionsMetricsQueryResult = Result<
    GetSessionsMetricsResponseBody,
    NetworkError
>;

type GetSessionsMetricsQueryOptions = Omit<
    UseQueryOptions<GetSessionsMetricsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSessionsMetrics(
    queryParams: GetSessionsMetricsQueryParams,
): Promise<GetSessionsMetricsQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getSessionsMetricsQueryParamsSchema,
    );

    const response = await fetch(`/api/sessions/metrics${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getSessionsMetricsResult: GetSessionsMetricsQueryResult =
        await response.json();
    return getSessionsMetricsResult;
}

export function useGetSessionsMetrics(
    queryParams: GetSessionsMetricsQueryParams,
    options?: GetSessionsMetricsQueryOptions,
) {
    return useQuery({
        queryKey: sessionKeys.sessionsMetricsByDistrict(queryParams),
        queryFn: () => fetchSessionsMetrics(queryParams),
        ...options,
    });
}

export function useGetSessionsMetricsByDistricts(
    districts: string[],
    startDate: string,
    endDate: string,
) {
    return useQueries({
        queries: districts.map(district => {
            const queryParams = { district, startDate, endDate };
            return {
                queryKey: sessionKeys.sessionsMetricsByDistrict(queryParams),
                queryFn: () => fetchSessionsMetrics(queryParams),
            };
        }),
    });
}
