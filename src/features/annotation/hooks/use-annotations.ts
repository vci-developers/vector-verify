import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  annotationKeys,
  type TaskAnnotationsQueryKey,
} from '@/features/annotation/api/annotation-keys';
import { getAnnotations } from '@/features/annotation/api/get-annotations';
import type {
  AnnotationsQuery,
  Annotation,
} from '@/features/annotation/types';
import type { OffsetPage } from '@/lib/entities/pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export function useTaskAnnotationsQuery(
  filters: AnnotationsQuery,
  options?: Omit<
    UseQueryOptions<
      OffsetPage<Annotation>,
      Error,
      OffsetPage<Annotation>,
      TaskAnnotationsQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  const {
    taskId,
    page = 1,
    limit = filters.limit ?? DEFAULT_PAGE_SIZE,
    status,
  } = filters;

  return useQuery({
    queryKey: annotationKeys.taskAnnotations(
      taskId,
      page,
      limit,
      status,
    ) as TaskAnnotationsQueryKey,
    queryFn: () =>
      getAnnotations({
        taskId,
        page,
        limit,
        status,
      }),
    enabled: Number.isFinite(taskId) && taskId > 0,
    ...(options ?? {}),
  });
}
