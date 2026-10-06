import { err, type Result } from '@/lib/result/result';
import {
    putSpecimenImageDataByIdRequestSchema,
    putSpecimenImageDataByIdResponseSchema,
    type PutSpecimenImageDataByIdRequestBody,
    type PutSpecimenImageDataByIdResponseBody,
} from '@/api/specimen-image/validation/put-specimen-image-data-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function putSpecimenImageDataById(
    accessToken: string,
    specimenId: number,
    imageId: number,
    requestBody: PutSpecimenImageDataByIdRequestBody,
): Promise<Result<PutSpecimenImageDataByIdResponseBody, NetworkError>> {
    const parsedRequestBody =
        putSpecimenImageDataByIdRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<PutSpecimenImageDataByIdResponseBody>(
        `/specimens/${specimenId}/images/data/${imageId}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        putSpecimenImageDataByIdResponseSchema,
    );
}
