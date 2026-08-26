import 'server-only';
import {
    postResourcesSignResponseSchema,
    type PostResourcesSignRequestBody,
    type PostResourcesSignResponseBody,
} from './validation/post-resources-sign-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postResourcesSign(
    accessToken: string,
    requestBody: PostResourcesSignRequestBody,
): Promise<Result<PostResourcesSignResponseBody, NetworkError>> {
    return safeApiCall<PostResourcesSignResponseBody>(
        '/resources/sign',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestBody),
        },
        postResourcesSignResponseSchema,
    );
}
