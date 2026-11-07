import { useMutation } from '@tanstack/react-query';
import type {
    PutSpecimenByIdRequestBody,
    PutSpecimenByIdResponseBody,
} from '@/api/specimen/validation/put-specimen-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';

type PutSpecimenByIdMutationResult = Result<
    PutSpecimenByIdResponseBody,
    NetworkError
>;

type PutSpecimenByIdVariables = {
    specimenId: number;
    requestBody: PutSpecimenByIdRequestBody;
};

async function updateSpecimenById(
    specimenId: number,
    requestBody: PutSpecimenByIdRequestBody,
): Promise<PutSpecimenByIdMutationResult> {
    const response = await fetch(`/api/specimens/${specimenId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result: PutSpecimenByIdMutationResult = await response.json();
    return result;
}

export function usePutSpecimenById() {
    return useMutation({
        mutationFn: ({ specimenId, requestBody }: PutSpecimenByIdVariables) =>
            updateSpecimenById(specimenId, requestBody),
    });
}
