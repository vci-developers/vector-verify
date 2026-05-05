import {
    getAnnotationsSummaryQueryParamsSchema,
    getAnnotationsSummaryResponseSchema,
    type GetAnnotationsSummaryQueryParams,
    type GetAnnotationsSummaryResponseBody,
} from '@/api/annotation/validation/get-annotations-summary-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getAnnotationsSummary(
    accessToken: string,
    queryParams?: GetAnnotationsSummaryQueryParams,
) {
    const queryString = constructQueryString<GetAnnotationsSummaryQueryParams>(
        queryParams,
        getAnnotationsSummaryQueryParamsSchema,
    );

    return safeApiCall<GetAnnotationsSummaryResponseBody>(
        `/annotations/summary${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getAnnotationsSummaryResponseSchema,
    );
}
