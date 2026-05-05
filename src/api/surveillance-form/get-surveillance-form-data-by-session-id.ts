import { ok, type Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';
import { getFormAnswersBySessionId } from '@/api/surveillance-form/get-form-answers-by-session-id';
import { getSurveillanceFormBySessionId } from '@/api/surveillance-form/get-surveillance-form-by-session-id';
import type { SurveillanceFormData } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';

export async function getSurveillanceFormDataBySessionId(
    accessToken: string,
    sessionId: number,
    version?: string,
): Promise<Result<SurveillanceFormData, NetworkError>> {
    const answersResult = await getFormAnswersBySessionId(
        accessToken,
        sessionId,
        version,
    );

    if (answersResult.ok && answersResult.data.answers.length > 0) {
        return ok({ kind: 'answers' as const, ...answersResult.data });
    }
    if (answersResult.ok || answersResult.error.kind === 'not_found') {
        const legacyResult = await getSurveillanceFormBySessionId(
            accessToken,
            sessionId,
        );
        if (legacyResult.ok) {
            return ok({ kind: 'legacy' as const, ...legacyResult.data });
        }
        return legacyResult;
    }
    return answersResult;
}
