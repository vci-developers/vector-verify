import type { Result } from '@/lib/result/result';
import {
    getSpecimensQueryParamsSchema,
    type GetSpecimensQueryParams,
    type GetSpecimensSuccessPayload,
} from '@/api/specimen/validation/get-specimens-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { useQuery } from '@tanstack/react-query';
import { specimenKeys } from '../specimen-keys';

async function fetchSpecimens(
    queryParams?: GetSpecimensQueryParams,
): Promise<Result<GetSpecimensSuccessPayload, NetworkError>> {
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

    const specimensResult: Result<GetSpecimensSuccessPayload, NetworkError> =
        await response.json();
    return specimensResult;
}

export function useSpecimens(queryParams?: GetSpecimensQueryParams) {
    return useQuery({
        queryKey: specimenKeys.specimens(queryParams),
        queryFn: () => fetchSpecimens(queryParams),
    });
}
