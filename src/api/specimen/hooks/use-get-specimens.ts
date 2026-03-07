import type { Result } from '@/lib/result/result';
import {
    getSpecimensQueryParamsSchema,
    type GetSpecimensQueryParams,
    type GetSpecimensSuccessPayload,
} from '@/api/specimen/validation/get-specimens-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { specimenKeys } from '../specimen-keys';

type GetSpecimensQueryResult = Result<GetSpecimensSuccessPayload, NetworkError>;

type GetSpecimensQueryOptions = Omit<
    UseQueryOptions<GetSpecimensQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

export async function fetchSpecimens(
    queryParams?: GetSpecimensQueryParams,
): Promise<GetSpecimensQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getSpecimensQueryParamsSchema,
    );

    const response = await fetch(`/api/specimens${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getSpecimensResult: GetSpecimensQueryResult = await response.json();
    return getSpecimensResult;
}

export function useGetSpecimens(
    queryParams?: GetSpecimensQueryParams,
    options?: GetSpecimensQueryOptions,
) {
    return useQuery({
        queryKey: specimenKeys.specimens(queryParams),
        queryFn: () => fetchSpecimens(queryParams),
        ...options,
    });
}
