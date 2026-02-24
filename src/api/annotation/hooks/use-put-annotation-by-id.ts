import { useMutation } from '@tanstack/react-query';
import type {
    PutAnnotationByIdRequestBody,
    PutAnnotationByIdSuccessPayload,
} from '@/api/annotation/validation/put-annotation-by-id-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type PutAnnotationByIdVariables = {
    annotationId: number;
    requestBody: PutAnnotationByIdRequestBody;
};

async function updateAnnotationById(
    annotationId: number,
    requestBody: PutAnnotationByIdRequestBody,
): Promise<Result<PutAnnotationByIdSuccessPayload, NetworkError>> {
    const response = await fetch(`/api/annotations/${annotationId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const annotationByIdResult: Result<
        PutAnnotationByIdSuccessPayload,
        NetworkError
    > = await response.json();
    return annotationByIdResult;
}

export function usePutAnnotationById() {
    return useMutation({
        mutationFn: ({
            annotationId,
            requestBody,
        }: PutAnnotationByIdVariables) =>
            updateAnnotationById(annotationId, requestBody),
    });
}
