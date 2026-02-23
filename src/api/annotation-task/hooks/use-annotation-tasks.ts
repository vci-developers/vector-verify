import {
    getAnnotationTasksQueryParamsSchema,
    type GetAnnotationTasksQueryParams,
    type GetAnnotationTasksSuccessPayload,
} from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { useQuery } from '@tanstack/react-query';
import { annotationTaskKeys } from '@/api/annotation-task/annotation-task-keys';
import type { NetworkError } from '@/lib/network/network-error';
import { constructQueryString } from '@/lib/network/construct-query-string';
import type { Result } from '@/lib/result/result';

async function fetchAnnotationTasks(
    queryParams?: GetAnnotationTasksQueryParams,
): Promise<Result<GetAnnotationTasksSuccessPayload, NetworkError>> {
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

    const annotationTasksResult: Result<
        GetAnnotationTasksSuccessPayload,
        NetworkError
    > = await response.json();
    return annotationTasksResult;
}

export function useAnnotationTasks(
    queryParams?: GetAnnotationTasksQueryParams,
) {
    return useQuery({
        queryKey: annotationTaskKeys.annotationTasks(queryParams),
        queryFn: () => fetchAnnotationTasks(queryParams),
    });
}
