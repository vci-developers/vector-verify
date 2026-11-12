import type { Result } from '@/lib/result/result';
import {
    getSessionsMetricsQueryParamsSchema,
    type GetSessionsMetricsQueryParams,
    type GetSessionsMetricsSuccessPayload,
} from '@/api/session/validation/get-sessions-metrics-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { sessionKeys } from '@/api/session/session-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetSessionsMetricsQueryResult = Result<
    GetSessionsMetricsSuccessPayload,
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
        queryKey: sessionKeys.sessionsMetrics(queryParams),
        queryFn: () => fetchSessionsMetrics(queryParams),
        ...options,
    });
}
