import type { QueryKey } from '@tanstack/react-query';
import type { AnnotationStatus } from '@/shared/entities/annotation/status';

export const annotationKeys = {
  root: ['annotations'] as const,
  tasks: (
    page?: number,
    limit?: number,
    startDate?: string,
    endDate?: string,
  ) =>
    [
      ...annotationKeys.root,
      'tasks',
      { page, limit, startDate, endDate },
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
  specimen: (specimenId: number) =>
    [...annotationKeys.root, 'specimen', specimenId] as const,
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
export type AnnotationSpecimenQueryKey = ReturnType<
  typeof annotationKeys.specimen
> &
  QueryKey;
