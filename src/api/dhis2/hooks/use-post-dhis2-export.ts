import {
    postDhis2ExportQueryParamsSchema,
    type PostDhis2ExportQueryParams,
    type PostDhis2ExportResponseBody,
} from '@/api/dhis2/validation/post-dhis2-export-schema';
import type { PostDhis2UgandaExportBody } from '@/api/dhis2/validation/post-dhis2-uganda-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useMutation } from '@tanstack/react-query';

type PostDhis2ExportVariables = {
    queryParams: PostDhis2ExportQueryParams;
    body: PostDhis2UgandaExportBody;
};

type PostDhis2ExportMutationResult = Result<
    PostDhis2ExportResponseBody,
    NetworkError
>;

async function submitDhis2Export({
    queryParams,
    body,
}: PostDhis2ExportVariables): Promise<PostDhis2ExportMutationResult> {
    const queryString = constructQueryString(
        queryParams,
        postDhis2ExportQueryParamsSchema,
    );

    const response = await fetch(`/api/dhis2/export${queryString}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const result: PostDhis2ExportMutationResult = await response.json();
    return result;
}

export function usePostDhis2Export() {
    return useMutation({
        mutationFn: (variables: PostDhis2ExportVariables) =>
            submitDhis2Export(variables),
    });
}
