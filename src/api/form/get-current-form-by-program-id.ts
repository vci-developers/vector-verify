import type { Result } from '@/lib/result/result';
import {
    getCurrentFormByProgramIdResponseSchema,
    type GetCurrentFormByProgramIdResponseBody,
} from './validation/get-current-form-by-program-id-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getCurrentFormByProgramId(
    accessToken: string,
    programId: number,
): Promise<Result<GetCurrentFormByProgramIdResponseBody, NetworkError>> {
    return safeApiCall<GetCurrentFormByProgramIdResponseBody>(
        `/programs/${programId}/forms/current`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getCurrentFormByProgramIdResponseSchema,
    );
}
