import { err, type Result } from '@/lib/result/result';
import {
    updateSessionRequestSchema,
    updateSessionResponseSchema,
    type UpdateSessionRequestBody,
    type UpdateSessionResponseBody,
} from '@/api/session/validation/update-session-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function updateSession(
    accessToken: string,
    sessionId: number,
    requestBody: UpdateSessionRequestBody,
): Promise<Result<UpdateSessionResponseBody, NetworkError>> {
    const parsedRequestBody =
        updateSessionRequestSchema.safeParse(requestBody);
    if (!parsedRequestBody.success) {
        return err({ kind: 'client' });
    }

    return safeApiCall<UpdateSessionResponseBody>(
        `/sessions/${sessionId}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(parsedRequestBody.data),
        },
        updateSessionResponseSchema,
    );
}
