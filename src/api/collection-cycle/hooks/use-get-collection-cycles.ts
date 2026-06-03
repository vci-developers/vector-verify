import { collectionCycleKeys } from '@/api/collection-cycle/collection-cycle-keys';
import {
    getCollectionCyclesQueryParamsSchema,
    type GetCollectionCyclesQueryParams,
    type GetCollectionCyclesSuccessPayload,
} from '@/api/collection-cycle/validation/get-collection-cycles-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type GetCollectionCyclesQueryResult = Result<
    GetCollectionCyclesSuccessPayload,
    NetworkError
>;

type GetCollectionCyclesQueryOptions = Omit<
    UseQueryOptions<GetCollectionCyclesQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchCollectionCycles(
    queryParams: GetCollectionCyclesQueryParams,
): Promise<GetCollectionCyclesQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getCollectionCyclesQueryParamsSchema,
    );
    const response = await fetch(`/api/collection-cycles${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
}

export function useGetCollectionCycles(
    queryParams: GetCollectionCyclesQueryParams,
    options?: GetCollectionCyclesQueryOptions,
) {
    return useQuery({
        queryKey: collectionCycleKeys.collectionCycles(queryParams),
        queryFn: () => fetchCollectionCycles(queryParams),
        ...options,
    });
}
