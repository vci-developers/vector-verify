import type { NetworkError } from '@/lib/network/network-error';
import {
    postDhis2SyncDryRunQueryParamsSchema,
    type PostDhis2SyncDryRunQueryParams,
    type PostDhis2SyncDryRunRequestBody,
    type PostDhis2SyncDryRunSuccessPayload,
} from '../validation/post-dhis2-sync-dry-run-schema';
import type { Result } from '@/lib/result/result';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { useMutation } from '@tanstack/react-query';

type PostDhis2SyncDryRunMutationResult = Result<
    PostDhis2SyncDryRunSuccessPayload,
    NetworkError
>;

type PostDhis2SyncDryRunVariables = {
    queryParams: PostDhis2SyncDryRunQueryParams;
    requestBody: PostDhis2SyncDryRunRequestBody;
};

async function runDhis2SyncDryRun(
    queryParams: PostDhis2SyncDryRunQueryParams,
    requestBody: PostDhis2SyncDryRunRequestBody,
): Promise<PostDhis2SyncDryRunMutationResult> {
    const queryString = constructQueryString<PostDhis2SyncDryRunQueryParams>(
        queryParams,
        postDhis2SyncDryRunQueryParamsSchema,
    );

    const response = await fetch(`/api/dhis2/sync/dryrun${queryString}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result: PostDhis2SyncDryRunMutationResult = await response.json();
    return result;
}

export function usePostDhis2SyncDryRun() {
    return useMutation({
        mutationFn: ({
            queryParams,
            requestBody,
        }: PostDhis2SyncDryRunVariables) =>
            runDhis2SyncDryRun(queryParams, requestBody),
    });
}
