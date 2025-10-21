import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  annotationKeys,
  type AnnotationTasksQueryKey,
} from '@/features/annotation/api/annotation-keys';
import { getAnnotationTasks } from '@/features/annotation/api/get-annotation-tasks';
import type {
  AnnotationTask,
  AnnotationTasksListFilters,
} from '@/features/annotation/types';
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
    createdAfter,
    createdBefore,
  } = filters;

  return useQuery({
    queryKey: annotationKeys.tasks(
      page,
      limit,
      taskStatus,
      taskTitle,
      createdAfter,
      createdBefore,
    ) as AnnotationTasksQueryKey,
    queryFn: () => getAnnotationTasks(filters),
    ...(options ?? {}),
  });
}
