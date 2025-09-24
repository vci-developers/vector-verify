import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  annotationKeys,
  type AnnotationTasksQueryKey,
} from '@/lib/annotate/keys';
import { getAnnotationTasks } from '@/lib/annotate/client';
import type { AnnotationTasksListFilters } from '@/lib/annotate/types';
import type { AnnotationTask } from '@/lib/entities/annotation';
import type { OffsetPage } from '@/lib/entities/pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export function useAnnotationTasksQuery(
  filters: AnnotationTasksListFilters = {},
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
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    taskStatus,
    taskTitle,
    taskYear,
  } = filters;

  return useQuery({
    queryKey: annotationKeys.tasks(
      page,
      limit,
      taskStatus,
      taskTitle,
      taskYear,
    ) as AnnotationTasksQueryKey,
    queryFn: () => getAnnotationTasks(filters),
    ...(options ?? {}),
  });
}
