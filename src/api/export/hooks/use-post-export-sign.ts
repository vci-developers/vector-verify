import type { Result } from '@/lib/result/result';
import type {
    PostExportSignRequestBody,
    PostExportSignSuccessPayload,
} from '../validation/post-export-sign-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useMutation } from '@tanstack/react-query';

type PostExportSignMutationResult = Result<
    PostExportSignSuccessPayload,
    NetworkError
>;

async function signExport(
    requestBody: PostExportSignRequestBody,
): Promise<PostExportSignMutationResult> {
    const response = await fetch('/api/export/sign', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result: PostExportSignMutationResult = await response.json();
    return result;
}

export function usePostExportSign() {
    return useMutation({
        mutationFn: (requestBody: PostExportSignRequestBody) =>
            signExport(requestBody),
    });
}
