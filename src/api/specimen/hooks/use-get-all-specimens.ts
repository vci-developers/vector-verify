import { specimenKeys } from '@/api/specimen/specimen-keys';
import {
    getAllSpecimensQueryParamsSchema,
    type GetAllSpecimensQueryParams,
    type GetAllSpecimensSuccessPayload,
} from '@/api/specimen/validation/get-all-specimens-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type GetAllSpecimensQueryResult = Result<
    GetAllSpecimensSuccessPayload,
    NetworkError
>;

type GetAllSpecimensQueryOptions = Omit<
    UseQueryOptions<GetAllSpecimensQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAllSpecimens(
    queryParams?: GetAllSpecimensQueryParams,
): Promise<GetAllSpecimensQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getAllSpecimensQueryParamsSchema,
    );

    const response = await fetch(`/api/specimens/all${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getAllSpecimensResult: GetAllSpecimensQueryResult =
        await response.json();
    return getAllSpecimensResult;
}

export function useGetAllSpecimens(
    queryParams?: GetAllSpecimensQueryParams,
    options?: GetAllSpecimensQueryOptions,
) {
    return useQuery({
        queryKey: specimenKeys.allSpecimens(queryParams),
        queryFn: () => fetchAllSpecimens(queryParams),
        ...options,
    });
}
