import {
  AnnotationTask,
  AnnotationTasksListResponseDto,
  mapAnnotationTasksListResponseDtoToPage,
} from '@/lib/entities/annotation';
import type { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/shared/http/client/bff-client';
import type { AnnotationTasksListFilters } from '@/lib/annotate/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export async function getAnnotationTasks(
  filters: AnnotationTasksListFilters = {},
): Promise<OffsetPage<AnnotationTask>> {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    taskTitle,
    taskStatus,
  } = filters;

  const query = {
    page,
    limit,
    title: taskTitle,
    status: taskStatus,
  };

  const data = await bff<AnnotationTasksListResponseDto>('/annotations/task', {
    method: 'GET',
    query,
  });

  return mapAnnotationTasksListResponseDtoToPage(data);
}
