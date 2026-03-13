import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';
import type { Result } from '@/lib/result/result';
import {
    getProgramsQueryParamsSchema,
    getProgramsResponseSchema,
    type GetProgramsQueryParams,
    type GetProgramsResponseBody,
} from '@/api/program/validation/get-programs-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';

export async function getPrograms(
    queryParams?: GetProgramsQueryParams,
): Promise<Result<GetProgramsResponseBody, NetworkError>> {
    const queryString = constructQueryString<GetProgramsQueryParams>(
        queryParams,
        getProgramsQueryParamsSchema,
    );

    return safeApiCall<GetProgramsResponseBody>(
        `/programs${queryString}`,
        {
            method: 'GET',
        },
        getProgramsResponseSchema,
    );
}
