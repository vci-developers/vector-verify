import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';
import type { Result } from '@/lib/result/result';
import {
    getProgramsResponseSchema,
    type GetProgramsResponseBody,
} from '@/api/program/validation/get-programs-schema';

export async function getPrograms(): Promise<
    Result<GetProgramsResponseBody, NetworkError>
> {
    return safeApiCall<GetProgramsResponseBody>(
        '/programs',
        {
            method: 'GET',
        },
        getProgramsResponseSchema,
    );
}
