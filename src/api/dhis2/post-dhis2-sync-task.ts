import 'server-only';

import {
    postDhis2SyncTaskQueryParamsSchema,
    postDhis2SyncTaskResponseSchema,
    type PostDhis2SyncTaskQueryParams,
    type PostDhis2SyncTaskRequestBody,
    type PostDhis2SyncTaskResponseBody,
} from './validation/post-dhis2-sync-task-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postDhis2SyncTask(
    accessToken: string,
    queryParams: PostDhis2SyncTaskQueryParams,
    requestBody: PostDhis2SyncTaskRequestBody,
): Promise<Result<PostDhis2SyncTaskResponseBody, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        postDhis2SyncTaskQueryParamsSchema,
    );

    return safeApiCall<PostDhis2SyncTaskResponseBody>(
        `/dhis2/sync${queryString}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestBody),
        },
        postDhis2SyncTaskResponseSchema,
    );
}
