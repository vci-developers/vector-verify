import { useMutation } from '@tanstack/react-query';
import type {
    PutSurveillanceFormRequestBody,
    PutSurveillanceFormSuccessPayload,
} from '@/api/surveillance-form/validation/put-surveillance-form-schema';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type PutSurveillanceFormMutationResult = Result<
    PutSurveillanceFormSuccessPayload,
    NetworkError
>;

type PutSurveillanceFormVariables = {
    formId: number;
    requestBody: PutSurveillanceFormRequestBody;
};

async function updateSurveillanceForm(
    formId: number,
    requestBody: PutSurveillanceFormRequestBody,
): Promise<PutSurveillanceFormMutationResult> {
    const response = await fetch(`/api/surveillance-forms/${formId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const putSurveillanceFormResult: PutSurveillanceFormMutationResult =
        await response.json();
    return putSurveillanceFormResult;
}

export function usePutSurveillanceForm() {
    return useMutation({
        mutationFn: ({ formId, requestBody }: PutSurveillanceFormVariables) =>
            updateSurveillanceForm(formId, requestBody),
    });
}
