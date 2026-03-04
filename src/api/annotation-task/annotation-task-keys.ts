import type { GetAnnotationTasksQueryParams } from '@/api/annotation-task/validation/get-annotation-tasks-schema';

export const annotationTaskKeys = {
    root: ['annotation-tasks'] as const,
    annotationTasks: (queryParams?: GetAnnotationTasksQueryParams) =>
        ['annotation-tasks', queryParams] as const,
};
