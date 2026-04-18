import type { Result } from '@/lib/result/result';
import {
    getMonthlySpecimensCountQueryParamsSchema,
    type GetMonthlySpecimensCountQueryParams,
    type GetMonthlySpecimensCountSuccessPayload,
} from '../validation/get-monthly-specimens-count-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { specimenKeys } from '../specimen-keys';

type GetMonthlySpecimensCountQueryResult = Result<
    GetMonthlySpecimensCountSuccessPayload,
    NetworkError
>;

type GetMonthlySpecimensCountQueryOptions = Omit<
    UseQueryOptions<GetMonthlySpecimensCountQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchMonthlySpecimensCount(
    queryParams?: GetMonthlySpecimensCountQueryParams,
): Promise<GetMonthlySpecimensCountQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getMonthlySpecimensCountQueryParamsSchema,
    );

    const response = await fetch(`/api/specimens/count/monthly${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getMonthlySpecimensCountResult: GetMonthlySpecimensCountQueryResult =
        await response.json();
    return getMonthlySpecimensCountResult;
}

export function useGetMonthlySpecimensCount(
    queryParams?: GetMonthlySpecimensCountQueryParams,
    options?: GetMonthlySpecimensCountQueryOptions,
) {
    return useQuery({
        queryKey: specimenKeys.monthlySpecimensCount(queryParams),
        queryFn: () => fetchMonthlySpecimensCount(queryParams),
        ...options,
    });
}
