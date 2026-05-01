import { err, type Result } from '@/lib/result/result';
import {
    putSessionRequestSchema,
    putSessionResponseSchema,
    type PutSessionRequestBody,
    type PutSessionResponseBody,
} from './validation/put-session-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function putSession(
    accessToken: string,
    sessionId: number,
    requestBody: PutSessionRequestBody,
): Promise<Result<PutSessionResponseBody, NetworkError>> {
    const parsedRequestBody = putSessionRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<PutSessionResponseBody>(
        `/sessions/${sessionId}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        putSessionResponseSchema,
    );
}
