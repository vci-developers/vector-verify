import type { NetworkError } from '@/lib/network/network-error';
import {
    getCollectionCyclesQueryParamsSchema,
    getCollectionCyclesResponseSchema,
    type GetCollectionCyclesQueryParams,
    type GetCollectionCyclesResponseBody,
} from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Result } from '@/lib/result/result';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getCollectionCycles(
    accessToken: string,
    queryParams: GetCollectionCyclesQueryParams,
): Promise<Result<GetCollectionCyclesResponseBody, NetworkError>> {
    const queryString = constructQueryString(
        queryParams,
        getCollectionCyclesQueryParamsSchema,
    );

    return safeApiCall<GetCollectionCyclesResponseBody>(
        `/programs/${queryParams.programId}/collection-cycles${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getCollectionCyclesResponseSchema,
    );
}
