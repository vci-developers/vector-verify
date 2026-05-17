import { err, type Result } from '@/lib/result/result';
import {
    putSessionByIdRequestSchema,
    putSessionByIdResponseSchema,
    type PutSessionByIdRequestBody,
    type PutSessionByIdResponseBody,
} from '@/api/session/validation/put-session-by-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function putSessionById(
    accessToken: string,
    sessionId: number,
    requestBody: PutSessionByIdRequestBody,
): Promise<Result<PutSessionByIdResponseBody, NetworkError>> {
    const parsedRequestBody =
        putSessionByIdRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<PutSessionByIdResponseBody>(
        `/sessions/${sessionId}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        putSessionByIdResponseSchema,
    );
}
