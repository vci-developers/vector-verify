import type { GetAnnotationTasksQueryParams } from '@/api/annotation-task/validation/get-annotation-tasks-schema';

export const annotationTaskKeys = {
    annotationTasks: (queryParams?: GetAnnotationTasksQueryParams) =>
        ['annotation-tasks', queryParams] as const,
};
