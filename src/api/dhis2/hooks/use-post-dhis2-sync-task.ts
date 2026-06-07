import type { Result } from '@/lib/result/result';
import {
    postDhis2SyncTaskQueryParamsSchema,
    type PostDhis2SyncTaskQueryParams,
    type PostDhis2SyncTaskRequestBody,
    type PostDhis2SyncTaskSuccessPayload,
} from '../validation/post-dhis2-sync-task-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dhis2SyncKeys } from '../dhis2-sync-keys';

type PostDhis2SyncTaskMutationResult = Result<
    PostDhis2SyncTaskSuccessPayload,
    NetworkError
>;

type PostDhis2SyncTaskVariables = {
    queryParams: PostDhis2SyncTaskQueryParams;
    requestBody: PostDhis2SyncTaskRequestBody;
};

async function createDhis2SyncTask(
    queryParams: PostDhis2SyncTaskQueryParams,
    requestBody: PostDhis2SyncTaskRequestBody,
): Promise<PostDhis2SyncTaskMutationResult> {
    const queryString = constructQueryString<PostDhis2SyncTaskQueryParams>(
        queryParams,
        postDhis2SyncTaskQueryParamsSchema,
    );

    const response = await fetch(`/api/dhis2/sync${queryString}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result: PostDhis2SyncTaskMutationResult = await response.json();
    return result;
}

export function usePostDhis2SyncTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            queryParams,
            requestBody,
        }: PostDhis2SyncTaskVariables) =>
            createDhis2SyncTask(queryParams, requestBody),
        onSuccess: (_result, { queryParams }) => {
            queryClient.invalidateQueries({
                queryKey: dhis2SyncKeys.syncTasks(queryParams),
            });
        },
    });
}
