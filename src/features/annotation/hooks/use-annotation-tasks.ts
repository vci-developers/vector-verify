import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  annotationKeys,
  type AnnotationTasksQueryKey,
} from '@/features/annotation/api/annotation-keys';
import { getAnnotationTasks } from '@/features/annotation/api/get-annotation-tasks';
import type {
  AnnotationTask,
  AnnotationTasksQuery,
} from '@/features/annotation/types';
import type { OffsetPage } from '@/shared/entities/pagination';
import { DEFAULT_PAGE_SIZE } from '@/shared/entities/pagination';

export function useAnnotationTasksQuery(
  filters: AnnotationTasksQuery = {},
  options?: Omit<
    UseQueryOptions<
      OffsetPage<AnnotationTask>,
      Error,
      OffsetPage<AnnotationTask>,
      AnnotationTasksQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, startDate, endDate } = filters;

  return useQuery({
    queryKey: annotationKeys.tasks(
      page,
      limit,
      startDate,
      endDate,
    ) as AnnotationTasksQueryKey,
    queryFn: () => getAnnotationTasks(filters),
    ...(options ?? {}),
  });
}
