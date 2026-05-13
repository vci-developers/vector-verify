import { err, type Result } from '@/lib/result/result';
import {
    putAnnotationByIdRequestSchema,
    putAnnotationByIdResponseSchema,
    type PutAnnotationByIdRequestBody,
    type PutAnnotationByIdResponseBody,
} from './validation/put-annotation-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function putAnnotationById(
    accessToken: string,
    annotationId: number,
    requestBody: PutAnnotationByIdRequestBody,
): Promise<Result<PutAnnotationByIdResponseBody, NetworkError>> {
    const parsedRequestBody =
        putAnnotationByIdRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<PutAnnotationByIdResponseBody>(
        `/annotations/${annotationId}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        putAnnotationByIdResponseSchema,
    );
}
