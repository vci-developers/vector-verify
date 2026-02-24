import type { NetworkError } from '@/lib/network/network-error';
import {
    getSpecimensQueryParamsSchema,
    getSpecimensResponseSchema,
    type GetSpecimensQueryParams,
    type GetSpecimensResponseBody,
} from '@/api/specimen/validation/get-specimens-schema';
import type { Result } from '@/lib/result/result';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getSpecimens(
    accessToken: string,
    queryParams?: GetSpecimensQueryParams,
): Promise<Result<GetSpecimensResponseBody, NetworkError>> {
    const queryString = constructQueryString<GetSpecimensQueryParams>(
        queryParams,
        getSpecimensQueryParamsSchema,
    );

    return safeApiCall<GetSpecimensResponseBody>(
        `/specimens${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getSpecimensResponseSchema,
    );
}
