import {
    getSpecimensCountQueryParamsSchema,
    getSpecimensCountResponseSchema,
    type GetSpecimensCountQueryParams,
    type GetSpecimensCountResponseBody,
} from '@/api/specimen/validation/get-specimens-count-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';
import type { Result } from '@/lib/result/result';

export async function getSpecimensCount(
    accessToken: string,
    queryParams?: GetSpecimensCountQueryParams,
): Promise<Result<GetSpecimensCountResponseBody, NetworkError>> {
    const queryString = constructQueryString<GetSpecimensCountQueryParams>(
        queryParams,
        getSpecimensCountQueryParamsSchema,
    );

    return safeApiCall<GetSpecimensCountResponseBody>(
        `/specimens/count${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getSpecimensCountResponseSchema,
    );
}
