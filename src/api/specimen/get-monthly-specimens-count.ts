import type { Result } from '@/lib/result/result';
import {
    getMonthlySpecimensCountQueryParamsSchema,
    getMonthlySpecimensCountResponseSchema,
    type GetMonthlySpecimensCountQueryParams,
    type GetMonthlySpecimensCountResponseBody,
} from './validation/get-monthly-specimens-count-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getMonthlySpecimensCount(
    accessToken: string,
    queryParams?: GetMonthlySpecimensCountQueryParams,
): Promise<Result<GetMonthlySpecimensCountResponseBody, NetworkError>> {
    const queryString =
        constructQueryString<GetMonthlySpecimensCountQueryParams>(
            queryParams,
            getMonthlySpecimensCountQueryParamsSchema,
        );

    return safeApiCall<GetMonthlySpecimensCountResponseBody>(
        `/specimens/count/monthly${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getMonthlySpecimensCountResponseSchema,
    );
}
