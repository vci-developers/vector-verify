import { err, type Result } from '@/lib/result/result';
import {
    putSurveillanceFormRequestSchema,
    putSurveillanceFormResponseSchema,
    type PutSurveillanceFormRequestBody,
    type PutSurveillanceFormResponseBody,
} from './validation/put-surveillance-form-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function putSurveillanceForm(
    accessToken: string,
    formId: number,
    requestBody: PutSurveillanceFormRequestBody,
): Promise<Result<PutSurveillanceFormResponseBody, NetworkError>> {
    const parsedRequestBody =
        putSurveillanceFormRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<PutSurveillanceFormResponseBody>(
        `/surveillance-forms/${formId}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        putSurveillanceFormResponseSchema,
    );
}
