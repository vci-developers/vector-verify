import { specimenKeys } from '@/api/specimen/specimen-keys';
import {
    getSpecimensQueryParamsSchema,
    type GetSpecimensQueryParams,
    type GetSpecimensSuccessPayload,
} from '@/api/specimen/validation/get-specimens-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import { ok, type Result } from '@/lib/result/result';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

const PAGINATED_SPECIMENS_PAGE_SIZE = 100;

type GetAllPaginatedSpecimensQueryResult = Result<
    GetSpecimensSuccessPayload,
    NetworkError
>;

type GetAllPaginatedSpecimensQueryOptions = Omit<
    UseQueryOptions<GetAllPaginatedSpecimensQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchSpecimensPage(
    queryParams: GetSpecimensQueryParams,
): Promise<GetAllPaginatedSpecimensQueryResult> {
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

    const getSpecimensResult: GetAllPaginatedSpecimensQueryResult =
        await response.json();
    return getSpecimensResult;
}

async function fetchAllPaginatedSpecimens(
    queryParams: GetSpecimensQueryParams,
): Promise<GetAllPaginatedSpecimensQueryResult> {
    let offset = 0;
    let total = 0;
    let hasMore = false;
    const specimens: GetSpecimensSuccessPayload['specimens'] = [];

    do {
        const getSpecimensResult = await fetchSpecimensPage({
            ...queryParams,
            limit: PAGINATED_SPECIMENS_PAGE_SIZE,
            offset,
        });

        if (!getSpecimensResult.ok) return getSpecimensResult;

        specimens.push(...getSpecimensResult.data.specimens);
        total = getSpecimensResult.data.total;
        hasMore = getSpecimensResult.data.hasMore;
        offset += getSpecimensResult.data.limit;
    } while (hasMore);

    return ok({
        specimens,
        total,
        limit: PAGINATED_SPECIMENS_PAGE_SIZE,
        offset: 0,
        hasMore: false,
    });
}

export function useGetAllPaginatedSpecimens(
    queryParams: GetSpecimensQueryParams,
    options?: GetAllPaginatedSpecimensQueryOptions,
) {
    return useQuery({
        queryKey: specimenKeys.allPaginatedSpecimens(queryParams),
        queryFn: () => fetchAllPaginatedSpecimens(queryParams),
        ...options,
    });
}
