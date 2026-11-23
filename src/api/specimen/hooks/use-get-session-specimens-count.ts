import type { Result } from '@/lib/result/result';
import {
    getSessionSpecimensCountQueryParamsSchema,
    type GetSessionSpecimensCountQueryParams,
    type GetSessionSpecimensCountSuccessPayload,
} from '@/api/specimen/validation/get-session-specimens-count-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { specimenKeys } from '@/api/specimen/specimen-keys';

type GetSessionSpecimensCountQueryResult = Result<
    GetSessionSpecimensCountSuccessPayload,
    NetworkError
>;

type GetSessionSpecimensCountQueryOptions = Omit<
    UseQueryOptions<GetSessionSpecimensCountQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSessionSpecimensCount(
    queryParams: GetSessionSpecimensCountQueryParams,
): Promise<GetSessionSpecimensCountQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getSessionSpecimensCountQueryParamsSchema,
    );

    const response = await fetch(
        `/api/specimens/count/sessions${queryString}`,
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );

    const getSessionSpecimensCountResult: GetSessionSpecimensCountQueryResult =
        await response.json();
    return getSessionSpecimensCountResult;
}

export function useGetSessionSpecimensCount(
    queryParams: GetSessionSpecimensCountQueryParams,
    options?: GetSessionSpecimensCountQueryOptions,
) {
    return useQuery({
        queryKey: specimenKeys.sessionSpecimensCount(queryParams),
        queryFn: () => fetchSessionSpecimensCount(queryParams),
        ...options,
    });
}
