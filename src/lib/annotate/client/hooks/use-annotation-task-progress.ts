import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { annotationKeys, type AnnotationTaskProgressQueryKey } from '@/lib/annotate/keys';
import { getAnnotationTaskProgress } from '@/lib/annotate/client';
import type { AnnotationTaskProgress } from '@/lib/entities/annotation';

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
