import type {
    GetAllSurveillanceFormsQueryParams,
    GetAllSurveillanceFormsResponseBody,
} from '@/api/surveillance-form/validation/get-all-surveillance-forms-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { ok, type Result } from '@/lib/result/result';
import { getSurveillanceFormBySessionId } from '@/api/surveillance-form/get-surveillance-form-by-session-id';

export async function getAllSurveillanceForms(
    accessToken: string,
    queryParams: GetAllSurveillanceFormsQueryParams,
): Promise<Result<GetAllSurveillanceFormsResponseBody, NetworkError>> {
    const results = await Promise.all(
        queryParams.sessionIds.map(sessionId =>
            getSurveillanceFormBySessionId(accessToken, sessionId),
        ),
    );

    const allSurveillanceForms = results
        .filter(result => result.ok)
        .map(result => result.data);

    return ok({
        message: `Retrieved ${allSurveillanceForms.length} surveillance forms successfully`,
        surveillanceForms: allSurveillanceForms,
    });
}
