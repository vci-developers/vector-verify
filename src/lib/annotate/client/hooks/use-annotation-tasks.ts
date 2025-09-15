import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  annotationKeys,
  type AnnotationTasksQueryKey,
} from '@/lib/annotate/keys';
import { getAnnotationTasks } from '@/lib/annotate/client';
import type { AnnotationTasksListFilters } from '@/lib/annotate/types';
import type { AnnotationTask } from '@/lib/entities/annotation';
import type { OffsetPage } from '@/lib/entities/pagination';

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
  return useQuery({
    queryKey: annotationKeys.tasks(
      filters.page ?? 1,
      filters.limit ?? 20,
      filters.taskStatus,
      filters.taskTitle,
    ) as AnnotationTasksQueryKey,
    queryFn: () => getAnnotationTasks(filters),
    ...(options ?? {}),
  });
}
