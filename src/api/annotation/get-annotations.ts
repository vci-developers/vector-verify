import {
    getAnnotationsQueryParamsSchema,
    getAnnotationsSchema,
    type GetAnnotationsQueryParams,
    type GetAnnotationsResponseBody,
} from '@/api/annotation/validation/get-annotations-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getAnnotations(
    accessToken: string,
    queryParams?: GetAnnotationsQueryParams,
) {
    const queryString = constructQueryString<GetAnnotationsQueryParams>(
        queryParams,
        getAnnotationsQueryParamsSchema,
    );

    return safeApiCall<GetAnnotationsResponseBody>(
        `/annotations${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getAnnotationsSchema,
    );
}
