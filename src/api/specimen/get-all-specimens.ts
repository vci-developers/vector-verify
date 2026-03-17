import {
    getAllSpecimensQueryParamsSchema,
    getAllSpecimensResponseSchema,
    type GetAllSpecimensQueryParams,
    type GetAllSpecimensResponseBody,
} from '@/api/specimen/validation/get-all-specimens-schema';

import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';
import type { Result } from '@/lib/result/result';

export async function getAllSpecimens(
    accessToken: string,
    queryParams?: GetAllSpecimensQueryParams,
): Promise<Result<GetAllSpecimensResponseBody, NetworkError>> {
    const queryString = constructQueryString<GetAllSpecimensQueryParams>(
        queryParams,
        getAllSpecimensQueryParamsSchema,
    );

    return safeApiCall<GetAllSpecimensResponseBody>(
        `/specimens/all${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getAllSpecimensResponseSchema,
    );
}
