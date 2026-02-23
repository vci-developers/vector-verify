import {
    getAnnotationsQueryParamsSchema,
    type GetAnnotationsQueryParams,
    type GetAnnotationsSuccessPayload,
} from '@/api/annotation/validation/get-annotations-schema';
import { useQuery } from '@tanstack/react-query';
import { annotationKeys } from '@/api/annotation/annotation-keys';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { Result } from '@/lib/result/result';
import type { NetworkError } from '@/lib/network/network-error';

async function fetchAnnotations(
    queryParams?: GetAnnotationsQueryParams,
): Promise<Result<GetAnnotationsSuccessPayload, NetworkError>> {
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

    const annotationsResult: Result<
        GetAnnotationsSuccessPayload,
        NetworkError
    > = await response.json();
    return annotationsResult;
}

export function useAnnotations(queryParams?: GetAnnotationsQueryParams) {
    return useQuery({
        queryKey: annotationKeys.annotations(queryParams),
        queryFn: () => fetchAnnotations(queryParams),
    });
}
