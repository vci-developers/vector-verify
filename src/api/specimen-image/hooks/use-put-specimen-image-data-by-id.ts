import { useMutation } from '@tanstack/react-query';
import type {
    PutSpecimenImageDataByIdRequestBody,
    PutSpecimenImageDataByIdSuccessPayload,
} from '@/api/specimen-image/validation/put-specimen-image-data-by-id-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type PutSpecimenImageDataByIdMutationResult = Result<
    PutSpecimenImageDataByIdSuccessPayload,
    NetworkError
>;

type PutSpecimenImageDataByIdVariables = {
    specimenId: number;
    imageId: number;
    requestBody: PutSpecimenImageDataByIdRequestBody;
};

async function updateSpecimenImageDataById(
    specimenId: number,
    imageId: number,
    requestBody: PutSpecimenImageDataByIdRequestBody,
): Promise<PutSpecimenImageDataByIdMutationResult> {
    const response = await fetch(
        `/api/specimens/${specimenId}/images/data/${imageId}`,
        {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        },
    );

    const putSpecimenImageDataByIdResult: PutSpecimenImageDataByIdMutationResult =
        await response.json();
    return putSpecimenImageDataByIdResult;
}

export function usePutSpecimenImageDataById() {
    return useMutation({
        mutationFn: ({
            specimenId,
            imageId,
            requestBody,
        }: PutSpecimenImageDataByIdVariables) =>
            updateSpecimenImageDataById(specimenId, imageId, requestBody),
    });
}
