import type { Result } from '@/lib/result/result';
import {
    getInterventionMetricsQueryParamsSchema,
    type GetInterventionMetricsQueryParams,
    type GetInterventionMetricsSuccessPayload,
} from '@/api/session/validation/get-intervention-metrics-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { sessionKeys } from '@/api/session/session-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetInterventionMetricsQueryResult = Result<
    GetInterventionMetricsSuccessPayload,
    NetworkError
>;

type GetInterventionMetricsQueryOptions = Omit<
    UseQueryOptions<GetInterventionMetricsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchInterventionMetrics(
    queryParams: GetInterventionMetricsQueryParams,
): Promise<GetInterventionMetricsQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getInterventionMetricsQueryParamsSchema,
    );

    const response = await fetch(`/api/sessions/metrics${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getInterventionMetricsResult: GetInterventionMetricsQueryResult =
        await response.json();
    return getInterventionMetricsResult;
}

export function useGetInterventionMetrics(
    queryParams: GetInterventionMetricsQueryParams,
    options?: GetInterventionMetricsQueryOptions,
) {
    return useQuery({
        queryKey: sessionKeys.interventionMetrics(queryParams),
        queryFn: () => fetchInterventionMetrics(queryParams),
        ...options,
    });
}
