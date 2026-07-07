import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import {
    getUserActiveMetricsQueryParamsSchema,
    type GetUserActiveMetricsQueryParams,
    type GetUserActiveMetricsSuccessPayload,
} from '@/api/user/validation/get-user-active-metrics-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetUserActiveMetricsQueryResult = Result<
    GetUserActiveMetricsSuccessPayload,
    NetworkError
>;

type GetUserActiveMetricsQueryOptions = Omit<
    UseQueryOptions<GetUserActiveMetricsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchUserActiveMetrics(
    queryParams?: GetUserActiveMetricsQueryParams,
): Promise<GetUserActiveMetricsQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getUserActiveMetricsQueryParamsSchema,
    );

    const response = await fetch(`/api/users/active-metrics${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getUserActiveMetricsResult: GetUserActiveMetricsQueryResult =
        await response.json();
    return getUserActiveMetricsResult;
}

export function useGetUserActiveMetrics(
    queryParams?: GetUserActiveMetricsQueryParams,
    options?: GetUserActiveMetricsQueryOptions,
) {
    return useQuery({
        queryKey: userKeys.activeMetrics(queryParams),
        queryFn: () => fetchUserActiveMetrics(queryParams),
        ...options,
    });
}
