import {
  AnnotationTask,
  AnnotationTasksListResponseDto,
  mapAnnotationTasksListResponseDtoToPage,
} from '@/features/annotation/types';
import type { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/api/bff-client';
import type { AnnotationTasksListFilters } from '@/features/annotation/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export async function getAnnotationTasks(
  filters: AnnotationTasksListFilters = {},
): Promise<OffsetPage<AnnotationTask>> {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    taskTitle,
    taskStatus,
    createdAfter,
    createdBefore,
  } = filters;

  const query = {
    page,
    limit,
    title: taskTitle,
    status: taskStatus,
    createdAfter,
    createdBefore,
  };

  const data = await bff<AnnotationTasksListResponseDto>('/annotations/task', {
    method: 'GET',
    query,
  });

  return mapAnnotationTasksListResponseDtoToPage(data);
}
