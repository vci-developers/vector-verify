import {
    type GetAllSpecimensQueryParams,
    type GetAllSpecimensResponseBody,
} from '@/api/specimen/validation/get-all-specimens-schema';

import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import { safeApiCall } from '@/lib/network/safe-api-call';
import { ok, type Result } from '@/lib/result/result';
import type { Specimen } from './validation/specimen-schema';
import {
    getSpecimensQueryParamsSchema,
    getSpecimensResponseSchema,
    type GetSpecimensResponseBody,
} from './validation/get-specimens-schema';

const LIMIT = 100;

export async function getAllSpecimens(
    accessToken: string,
    queryParams: GetAllSpecimensQueryParams,
): Promise<Result<GetAllSpecimensResponseBody, NetworkError>> {
    const allSpecimens: Specimen[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const queryString = constructQueryString(
            { ...queryParams, limit: LIMIT, offset },
            getSpecimensQueryParamsSchema,
        );

        const result = await safeApiCall<GetSpecimensResponseBody>(
            `/specimens${queryString}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            getSpecimensResponseSchema,
        );

        if (!result.ok) return result;
        
        allSpecimens.push(...result.data.specimens);
        hasMore = result.data.hasMore;
        offset += LIMIT;
    }

    return ok({
        message: `Retrieved ${allSpecimens.length} specimens successfully`,
        specimens: allSpecimens,
    });
}
