import type { NetworkError } from '@/lib/network/network-error';
import {
    getDhis2SyncTasksQueryParamsSchema,
    type GetDhis2SyncTasksQueryParams,
    type GetDhis2SyncTasksSuccessPayload,
} from '../validation/get-dhis2-sync-tasks-schema';
import type { Result } from '@/lib/result/result';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { dhis2SyncKeys } from '../dhis2-sync-keys';

type GetDhis2SyncTasksQueryResult = Result<
    GetDhis2SyncTasksSuccessPayload,
    NetworkError
>;

type GetDhis2SyncTasksQueryOptions = Omit<
    UseQueryOptions<GetDhis2SyncTasksQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchDhis2SyncTasks(
    queryParams: GetDhis2SyncTasksQueryParams,
): Promise<GetDhis2SyncTasksQueryResult> {
    const queryString = constructQueryString<GetDhis2SyncTasksQueryParams>(
        queryParams,
        getDhis2SyncTasksQueryParamsSchema,
    );

    const response = await fetch(`/api/dhis2/sync${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getDhis2SyncTasksResult: GetDhis2SyncTasksQueryResult =
        await response.json();
    return getDhis2SyncTasksResult;
}

export function useGetDhis2SyncTasks(
    queryParams: GetDhis2SyncTasksQueryParams,
    options?: GetDhis2SyncTasksQueryOptions,
) {
    return useQuery({
        queryKey: dhis2SyncKeys.syncTasks(queryParams),
        queryFn: () => fetchDhis2SyncTasks(queryParams),
        ...options,
    });
}
