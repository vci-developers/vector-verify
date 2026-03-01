import {
    getAnnotationTasksQueryParamsSchema,
    type GetAnnotationTasksQueryParams,
    type GetAnnotationTasksSuccessPayload,
} from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { annotationTaskKeys } from '@/api/annotation-task/annotation-task-keys';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { Result } from '@/lib/result/result';

type GetAnnotationTasksQueryResult = Result<
    GetAnnotationTasksSuccessPayload,
    NetworkError
>;

type GetAnnotationTasksQueryOptions = Omit<
    UseQueryOptions<GetAnnotationTasksQueryResult, NetworkError>,
    'queryKey' | 'queryFn'
>;

async function fetchAnnotationTasks(
    queryParams?: GetAnnotationTasksQueryParams,
): Promise<GetAnnotationTasksQueryResult> {
    const queryString = constructQueryString<GetAnnotationTasksQueryParams>(
        queryParams,
        getAnnotationTasksQueryParamsSchema,
    );

    const response = await fetch(`/api/annotations/task${queryString}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const getAnnotationTasksResult: GetAnnotationTasksQueryResult =
        await response.json();
    return getAnnotationTasksResult;
}

export function useGetAnnotationTasks(
    queryParams?: GetAnnotationTasksQueryParams,
    options?: GetAnnotationTasksQueryOptions,
) {
    return useQuery({
        queryKey: annotationTaskKeys.annotationTasks(queryParams),
        queryFn: () => fetchAnnotationTasks(queryParams),
        ...options,
    });
}
