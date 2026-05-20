import { specimenKeys } from '@/api/specimen/specimen-keys';
import {
    getSpecimensCountQueryParamsSchema,
    type GetSpecimensCountQueryParams,
    type GetSpecimensCountSuccessPayload,
} from '@/api/specimen/validation/get-specimens-count-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type GetSpecimensCountQueryResult = Result<
    GetSpecimensCountSuccessPayload,
    NetworkError
>;

type GetSpecimensCountQueryOptions = Omit<
    UseQueryOptions<GetSpecimensCountQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSpecimensCount(
    queryParams?: GetSpecimensCountQueryParams,
): Promise<GetSpecimensCountQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getSpecimensCountQueryParamsSchema,
    );

    const response = await fetch(`/api/specimens/count${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getSpecimensCountResult: GetSpecimensCountQueryResult =
        await response.json();
    return getSpecimensCountResult;
}

export function useGetSpecimensCount(
    queryParams?: GetSpecimensCountQueryParams,
    options?: GetSpecimensCountQueryOptions,
) {
    return useQuery({
        queryKey: specimenKeys.specimensCount(queryParams),
        queryFn: () => fetchSpecimensCount(queryParams),
        ...options,
    });
}
