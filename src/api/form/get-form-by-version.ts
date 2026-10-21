import type { Result } from '@/lib/result/result';
import {
    getFormByVersionResponseSchema,
    type GetFormByVersionResponseBody,
} from './validation/get-form-by-version-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getFormByVersion(
    accessToken: string,
    programId: number,
    version: string,
): Promise<Result<GetFormByVersionResponseBody, NetworkError>> {
    return safeApiCall<GetFormByVersionResponseBody>(
        `/programs/${programId}/forms/${encodeURIComponent(version)}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getFormByVersionResponseSchema,
    );
}
