import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import {
    getSurveillanceFormBySessionIdSchema,
    type GetSurveillanceFormBySessionIdResponseBody,
} from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getSurveillanceFormBySessionId(
    accessToken: string,
    sessionId: number,
): Promise<Result<GetSurveillanceFormBySessionIdResponseBody, NetworkError>> {
    return safeApiCall<GetSurveillanceFormBySessionIdResponseBody>(
        `/sessions/${sessionId}/surveillance-form`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getSurveillanceFormBySessionIdSchema,
    );
}
