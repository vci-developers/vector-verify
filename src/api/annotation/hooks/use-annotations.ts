import {
    getAnnotationsQueryParamsSchema,
    type GetAnnotationsQueryParams,
    type GetAnnotationsSuccessPayload,
} from '@/api/annotation/validation/get-annotations-schema';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { annotationKeys } from '@/api/annotation/annotation-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

type AnnotationsQueryResult = Result<
    GetAnnotationsSuccessPayload,
    NetworkError
>;

type AnnotationsQueryOptions = Omit<
    UseQueryOptions<AnnotationsQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAnnotations(
    queryParams?: GetAnnotationsQueryParams,
): Promise<AnnotationsQueryResult> {
    const queryString = constructQueryString<GetAnnotationsQueryParams>(
        queryParams,
        getAnnotationsQueryParamsSchema,
    );

    const response = await fetch(`/api/annotations${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const annotationsResult: AnnotationsQueryResult = await response.json();
    return annotationsResult;
}

export function useAnnotations(
    queryParams?: GetAnnotationsQueryParams,
    options?: AnnotationsQueryOptions,
) {
    return useQuery({
        queryKey: annotationKeys.annotations(queryParams),
        queryFn: () => fetchAnnotations(queryParams),
        ...options,
    });
}
