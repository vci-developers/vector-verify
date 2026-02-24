import type { Result } from '@/lib/result/result';
import {
    getSessionByIdResponseSchema,
    type GetSessionByIdResponseBody,
} from '@/api/session/validation/get-session-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getSessionById(
    accessToken: string,
    sessionId: number,
): Promise<Result<GetSessionByIdResponseBody, NetworkError>> {
    return safeApiCall<GetSessionByIdResponseBody>(
        `/sessions/${sessionId}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getSessionByIdResponseSchema,
    );
}
