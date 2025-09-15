import { QueryKey } from "@tanstack/react-query";

export const annotationKeys = {
  root: ['annotations'] as const,
  tasks: (
    page: number,
    limit: number,
    taskStatus?: string,
  ) =>
    [
      ...annotationKeys.root,
      'tasks',
      { page, limit, taskStatus },
    ] as const,
};

export type AnnotationTasksQueryKey = ReturnType<typeof annotationKeys.tasks> & QueryKey;