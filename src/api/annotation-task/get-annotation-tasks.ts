import {
    getAnnotationTasksQueryParamsSchema,
    getAnnotationTasksResponseSchema,
    type GetAnnotationTasksQueryParams,
    type GetAnnotationTasksResponseBody,
} from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { safeApiCall } from '@/lib/network/safe-api-call';

export async function getAnnotationTasks(
    accessToken: string,
    queryParams?: GetAnnotationTasksQueryParams,
) {
    const queryString = constructQueryString<GetAnnotationTasksQueryParams>(
        queryParams,
        getAnnotationTasksQueryParamsSchema,
    );

    return safeApiCall<GetAnnotationTasksResponseBody>(
        `/annotations/task${queryString}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
        getAnnotationTasksResponseSchema,
    );
}
