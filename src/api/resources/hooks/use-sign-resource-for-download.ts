import type { Result } from '@/lib/result/result';
import type {
    PostResourcesSignRequestBody,
    PostResourcesSignSuccessPayload,
} from '../validation/post-resources-sign-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { useMutation } from '@tanstack/react-query';

type SignResourceMutationResult = Result<
    PostResourcesSignSuccessPayload,
    NetworkError
>;

async function signResource(
    requestBody: PostResourcesSignRequestBody,
): Promise<SignResourceMutationResult> {
    const response = await fetch('/api/resources/sign', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result: SignResourceMutationResult = await response.json();
    return result;
}

export function useSignResourceForDownload() {
    return useMutation({
        mutationFn: (requestBody: PostResourcesSignRequestBody) =>
            signResource(requestBody),
    });
}
