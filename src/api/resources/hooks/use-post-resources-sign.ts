import type { Result } from '@/lib/result/result';
import type {
    PostResourcesSignRequestBody,
    PostResourcesSignSuccessPayload,
} from '../validation/post-resources-sign-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useMutation } from '@tanstack/react-query';

type PostResourcesSignMutationResult = Result<
    PostResourcesSignSuccessPayload,
    NetworkError
>;

async function signResources(
    requestBody: PostResourcesSignRequestBody,
): Promise<PostResourcesSignMutationResult> {
    const response = await fetch('/api/resources/sign', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result: PostResourcesSignMutationResult = await response.json();
    return result;
}

export function usePostResourcesSign() {
    return useMutation({
        mutationFn: (requestBody: PostResourcesSignRequestBody) =>
            signResources(requestBody),
    });
}
