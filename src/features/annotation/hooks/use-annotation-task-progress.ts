import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  annotationKeys,
  type AnnotationTaskProgressQueryKey,
} from '@/features/annotation/api/annotation-keys';
import { getAnnotationTaskProgress } from '@/features/annotation/api/get-annotation-task-progress';
import type { AnnotationTaskProgress } from '@/features/annotation/types';

export function useAnnotationTaskProgressQuery(
  taskId: number,
  options?: Omit<
    UseQueryOptions<
      AnnotationTaskProgress,
      Error,
      AnnotationTaskProgress,
      AnnotationTaskProgressQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: annotationKeys.taskProgress(taskId) as AnnotationTaskProgressQueryKey,
    queryFn: () => getAnnotationTaskProgress(taskId),
    enabled: Number.isFinite(taskId) && taskId > 0,
    ...(options ?? {}),
  });
}
