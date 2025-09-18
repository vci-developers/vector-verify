import type { QueryKey } from '@tanstack/react-query';
import type { AnnotationTaskStatus } from '@/lib/entities/annotation';

export const annotationKeys = {
  root: ['annotations'] as const,
  tasks: (
    page: number,
    limit: number,
    taskStatus?: AnnotationTaskStatus,
    taskTitle?: string,
  ) =>
    [
      ...annotationKeys.root,
      'tasks',
      { page, limit, taskStatus, taskTitle },
    ] as const,
  taskProgress: (taskId: number) =>
    [...annotationKeys.root, 'task-progress', taskId] as const,
};

export type AnnotationTasksQueryKey = ReturnType<typeof annotationKeys.tasks> &
  QueryKey;
export type AnnotationTaskProgressQueryKey = ReturnType<
  typeof annotationKeys.taskProgress
> &
  QueryKey;
