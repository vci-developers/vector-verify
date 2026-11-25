import type { Result } from '@/lib/result/result';
import {
    getSessionSpecimensCountQueryParamsSchema,
    getSessionSpecimensCountResponseSchema,
    type GetSessionSpecimensCountQueryParams,
    type GetSessionSpecimensCountResponseBody,
} from '@/api/specimen/validation/get-session-specimens-count-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getSessionSpecimensCount(
    accessToken: string,
    queryParams: GetSessionSpecimensCountQueryParams,
): Promise<Result<GetSessionSpecimensCountResponseBody, NetworkError>> {
    const queryString =
        constructQueryString<GetSessionSpecimensCountQueryParams>(
            queryParams,
            getSessionSpecimensCountQueryParamsSchema,
        );

    return safeApiCall<GetSessionSpecimensCountResponseBody>(
        `/specimens/count/sessions${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getSessionSpecimensCountResponseSchema,
    );
}
