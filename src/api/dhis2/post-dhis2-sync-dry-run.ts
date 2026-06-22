import 'server-only';

import type { Result } from '@/lib/result/result';
import {
    postDhis2SyncDryRunQueryParamsSchema,
    postDhis2SyncDryRunResponseSchema,
    type PostDhis2SyncDryRunQueryParams,
    type PostDhis2SyncDryRunRequestBody,
    type PostDhis2SyncDryRunResponseBody,
} from './validation/post-dhis2-sync-dry-run-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postDhis2SyncDryRun(
    accessToken: string,
    queryParams: PostDhis2SyncDryRunQueryParams,
    requestBody: PostDhis2SyncDryRunRequestBody,
): Promise<Result<PostDhis2SyncDryRunResponseBody, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        postDhis2SyncDryRunQueryParamsSchema,
    );

    return safeApiCall<PostDhis2SyncDryRunResponseBody>(
        `/dhis2/sync${queryString}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestBody),
        },
        postDhis2SyncDryRunResponseSchema,
    );
}
