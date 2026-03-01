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

type SpecimensQueryResult = Result<GetSpecimensSuccessPayload, NetworkError>;

type SpecimensQueryOptions = Omit<
    UseQueryOptions<SpecimensQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSpecimens(
    queryParams?: GetSpecimensQueryParams,
): Promise<SpecimensQueryResult> {
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

    const specimensResult: SpecimensQueryResult = await response.json();
    return specimensResult;
}

export function useSpecimens(
    queryParams?: GetSpecimensQueryParams,
    options?: SpecimensQueryOptions,
) {
    return useQuery({
        queryKey: specimenKeys.specimens(queryParams),
        queryFn: () => fetchSpecimens(queryParams),
        ...options,
    });
}
