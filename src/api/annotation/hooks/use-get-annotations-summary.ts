import { annotationKeys } from '@/api/annotation/annotation-keys';
import {
    getAnnotationsSummaryQueryParamsSchema,
    type GetAnnotationsSummaryQueryParams,
    type GetAnnotationsSummarySuccessPayload,
} from '@/api/annotation/validation/get-annotations-summary-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type GetAnnotationsSummaryQueryResult = Result<
    GetAnnotationsSummarySuccessPayload,
    NetworkError
>;

type GetAnnotationsSummaryQueryOptions = Omit<
    UseQueryOptions<GetAnnotationsSummaryQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAnnotationsSummary(
    queryParams?: GetAnnotationsSummaryQueryParams,
): Promise<GetAnnotationsSummaryQueryResult> {
    const queryString = constructQueryString(
        queryParams,
        getAnnotationsSummaryQueryParamsSchema,
    );

    const response = await fetch(`/api/annotations/summary${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getAnnotationsSummaryResult: GetAnnotationsSummaryQueryResult =
        await response.json();
    return getAnnotationsSummaryResult;
}

export function useGetAnnotationsSummary(
    queryParams?: GetAnnotationsSummaryQueryParams,
    options?: GetAnnotationsSummaryQueryOptions,
) {
    return useQuery({
        queryKey: annotationKeys.annotationsSummary(queryParams),
        queryFn: () => fetchAnnotationsSummary(queryParams),
        ...options,
    });
}
