import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { resourcesKeys } from '@/api/resources/resources-keys';
import type { Result } from '@/lib/result/result';
import type {
    PostResourcesSignRequestBody,
    PostResourcesSignSuccessPayload,
} from '@/api/resources/validation/post-resources-sign-schema';
import type { NetworkError } from '@/lib/network/network-error';

type SignedResourceQueryResult = Result<
    PostResourcesSignSuccessPayload,
    NetworkError
>;

type SignedResourceQueryOptions = Omit<
    UseQueryOptions<SignedResourceQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

const SIGNED_RESOURCE_STALE_TIME_MS = 55 * 60 * 1000;

async function signResource(path: string): Promise<SignedResourceQueryResult> {
    const requestBody: PostResourcesSignRequestBody = { path };

    const response = await fetch('/api/resources/sign', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result: SignedResourceQueryResult = await response.json();
    return result;
}

export function useSignedResourceUrl(
    path: string,
    options?: SignedResourceQueryOptions,
) {
    return useQuery({
        queryKey: resourcesKeys.sign(path),
        queryFn: () => signResource(path),
        staleTime: SIGNED_RESOURCE_STALE_TIME_MS,
        ...options,
    });
}
