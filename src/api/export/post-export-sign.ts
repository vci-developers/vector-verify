import 'server-only';
import {
    postExportSignResponseSchema,
    type PostExportSignRequestBody,
    type PostExportSignResponseBody,
} from './validation/post-export-sign-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function postExportSign(
    accessToken: string,
    requestBody: PostExportSignRequestBody,
): Promise<Result<PostExportSignResponseBody, NetworkError>> {
    return safeApiCall<PostExportSignResponseBody>(
        '/export/sign',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestBody),
        },
        postExportSignResponseSchema,
    );
}
