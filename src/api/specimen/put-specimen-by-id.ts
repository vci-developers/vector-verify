import {
    putSpecimenByIdResponseSchema,
    type PutSpecimenByIdRequestBody,
    type PutSpecimenByIdSuccessPayload,
} from '@/api/specimen/validation/put-specimen-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';
import type { Result } from '@/lib/result/result';

export async function putSpecimenById(
    accessToken: string,
    specimenId: number,
    requestBody: PutSpecimenByIdRequestBody,
): Promise<Result<PutSpecimenByIdSuccessPayload, NetworkError>> {
    return safeApiCall<PutSpecimenByIdSuccessPayload>(
        `/specimens/${specimenId}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestBody),
        },
        putSpecimenByIdResponseSchema,
    );
}
