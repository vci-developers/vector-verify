import {
    putSpecimenByIdRequestSchema,
    putSpecimenByIdResponseSchema,
    type PutSpecimenByIdRequestBody,
    type PutSpecimenByIdResponseBody,
} from '@/api/specimen/validation/put-specimen-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';
import { err, type Result } from '@/lib/result/result';

export async function putSpecimenById(
    accessToken: string,
    specimenId: number,
    requestBody: PutSpecimenByIdRequestBody,
): Promise<Result<PutSpecimenByIdResponseBody, NetworkError>> {
    const parsedRequestBody =
        putSpecimenByIdRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client', status: 400 });
    }

    return safeApiCall<PutSpecimenByIdResponseBody>(
        `/specimens/${specimenId}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        putSpecimenByIdResponseSchema,
    );
}
