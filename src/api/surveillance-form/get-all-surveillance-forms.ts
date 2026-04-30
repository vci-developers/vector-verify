import type {
    GetAllSurveillanceFormsQueryParams,
    GetAllSurveillanceFormsResponseBody,
} from '@/api/surveillance-form/validation/get-all-surveillance-forms-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { ok, type Result } from '@/lib/result/result';
import { getSurveillanceFormBySessionId } from '@/api/surveillance-form/get-surveillance-form-by-session-id';

export async function getAllSurveillanceForms(
    accessToken: string,
    queryParams: GetAllSurveillanceFormsQueryParams,
): Promise<Result<GetAllSurveillanceFormsResponseBody, NetworkError>> {
    const getAllSurveillanceFormsResult = await Promise.all(
        queryParams.sessionId.map(sessionId =>
            getSurveillanceFormBySessionId(accessToken, sessionId),
        ),
    );

    const surveillanceForms: SurveillanceForm[] = [];
    for (const result of getAllSurveillanceFormsResult) {
        if (result.ok) {
            surveillanceForms.push(result.data);
        } else if (result.error.kind !== 'not_found') {
            return result;
        }
    }

    return ok({
        message: `Retrieved ${surveillanceForms.length} surveillance forms successfully`,
        surveillanceForms,
    });
}
