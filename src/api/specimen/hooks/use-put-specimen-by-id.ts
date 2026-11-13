import { useMutation } from '@tanstack/react-query';
import {
    putSpecimenByIdResultSchema,
    type PutSpecimenByIdRequestBody,
    type PutSpecimenByIdResult,
} from '@/api/specimen/validation/put-specimen-by-id-schema';
import { err } from '@/lib/result/result';

type PutSpecimenByIdVariables = {
    specimenId: number;
    requestBody: PutSpecimenByIdRequestBody;
};

async function updateSpecimenById(
    specimenId: number,
    requestBody: PutSpecimenByIdRequestBody,
): Promise<PutSpecimenByIdResult> {
    const response = await fetch(`/api/specimens/${specimenId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const responseBody: unknown = await response.json();
    const parsedResult = putSpecimenByIdResultSchema.safeParse(responseBody);
    return parsedResult.success ? parsedResult.data : err({ kind: 'client' });
}

export function usePutSpecimenById() {
    return useMutation({
        mutationFn: ({ specimenId, requestBody }: PutSpecimenByIdVariables) =>
            updateSpecimenById(specimenId, requestBody),
    });
}
