import type { Result } from '@/lib/result/result';
import {
    getSpecimenByIdResponseSchema,
    type GetSpecimenByIdResponseBody,
} from '@/api/specimen/validation/get-specimen-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getSpecimenById(
    accessToken: string,
    specimenId: number,
): Promise<Result<GetSpecimenByIdResponseBody, NetworkError>> {
    return safeApiCall<GetSpecimenByIdResponseBody>(
        `/specimens/${specimenId}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getSpecimenByIdResponseSchema,
    );
}
