import {
    type PostDhis2ExportRequestBody,
    type PostDhis2ExportResponseBody,
} from '@/api/dhis2/validation/post-dhis2-export-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useMutation } from '@tanstack/react-query';

type PostDhis2ExportMutationResult = Result<
    PostDhis2ExportResponseBody,
    NetworkError
>;

async function submitDhis2Export(
    requestBody: PostDhis2ExportRequestBody,
): Promise<PostDhis2ExportMutationResult> {
    const response = await fetch('/api/dhis2/export', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    const result: PostDhis2ExportMutationResult = await response.json();
    return result;
}

export function usePostDhis2Export() {
    return useMutation({
        mutationFn: (requestBody: PostDhis2ExportRequestBody) =>
            submitDhis2Export(requestBody),
    });
}
