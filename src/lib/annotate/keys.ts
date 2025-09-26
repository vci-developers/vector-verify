import type { QueryKey } from '@tanstack/react-query';
import type {
  AnnotationStatus,
  AnnotationTaskStatus,
} from '@/lib/entities/annotation';

export const annotationKeys = {
  root: ['annotations'] as const,
  tasks: (
    page?: number,
    limit?: number,
    taskStatus?: AnnotationTaskStatus,
    taskTitle?: string,
    createdAfter?: string,
    createdBefore?: string,
  ) =>
    [
      ...annotationKeys.root,
      'tasks',
      { page, limit, taskStatus, taskTitle, createdAfter, createdBefore },
    ] as const,
  taskProgress: (taskId: number) =>
    [...annotationKeys.root, 'task-progress', taskId] as const,
  taskAnnotations: (
    taskId: number,
    page?: number,
    limit?: number,
    status?: AnnotationStatus,
  ) =>
    [
      ...annotationKeys.root,
      'task-annotations',
      { taskId, page, limit, status },
    ] as const,
};

export type AnnotationTasksQueryKey = ReturnType<typeof annotationKeys.tasks> &
  QueryKey;
export type AnnotationTaskProgressQueryKey = ReturnType<
  typeof annotationKeys.taskProgress
> &
  QueryKey;
export type TaskAnnotationsQueryKey = ReturnType<
  typeof annotationKeys.taskAnnotations
> &
  QueryKey;
