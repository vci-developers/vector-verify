import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userKeys } from '@/api/user/user-keys';
import {
    getAllUserActiveMetricsQueryParamsSchema,
    type GetAllUserActiveMetricsQueryParams,
    type GetAllUserActiveMetricsSuccessPayload,
} from '@/api/user/validation/get-all-user-active-metrics-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';

type GetAllUserActiveMetricsQueryResult = Result<
    GetAllUserActiveMetricsSuccessPayload,
    NetworkError
>;

type GetAllUserActiveMetricsQueryOptions = Omit<
    UseQueryOptions<GetAllUserActiveMetricsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAllUserActiveMetrics(
    queryParams: GetAllUserActiveMetricsQueryParams,
): Promise<GetAllUserActiveMetricsQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getAllUserActiveMetricsQueryParamsSchema,
    );

    const response = await fetch(
        `/api/users/active-metrics/all${queryString}`,
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    const getAllUserActiveMetricsResult: GetAllUserActiveMetricsQueryResult =
        await response.json();
    return getAllUserActiveMetricsResult;
}

export function useGetAllUserActiveMetrics(
    queryParams: GetAllUserActiveMetricsQueryParams,
    options?: GetAllUserActiveMetricsQueryOptions,
) {
    return useQuery({
        queryKey: userKeys.allActiveMetrics(queryParams),
        queryFn: () => fetchAllUserActiveMetrics(queryParams),
        ...options,
    });
}
