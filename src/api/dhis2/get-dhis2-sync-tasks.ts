import 'server-only';
import {
    getDhis2SyncTasksQueryParamsSchema,
    getDhis2SyncTasksResponseSchema,
    type GetDhis2SyncTasksQueryParams,
    type GetDhis2SyncTasksResponseBody,
} from './validation/get-dhis2-sync-tasks-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getDhis2SyncTasks(
    accessToken: string,
    queryParams: GetDhis2SyncTasksQueryParams,
): Promise<Result<GetDhis2SyncTasksResponseBody, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        getDhis2SyncTasksQueryParamsSchema,
    );

    return safeApiCall<GetDhis2SyncTasksResponseBody>(
        `/dhis2/sync${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getDhis2SyncTasksResponseSchema,
    );
}
