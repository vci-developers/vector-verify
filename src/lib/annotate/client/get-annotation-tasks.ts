import {
  AnnotationTask,
  AnnotationTasksListResponseDto,
  mapAnnotationTasksListResponseDtoToPage,
} from '@/lib/entities/annotation';
import type { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/shared/http/client/bff-client';
import type { AnnotationTasksListFilters } from '@/lib/annotate/types';

export async function getAnnotationTasks(
  options: AnnotationTasksListFilters = {},
): Promise<OffsetPage<AnnotationTask>> {
  const query = {
    page: options.page ?? 1,
    limit: options.limit ?? 20,
    title: options.taskTitle,
    status: options.taskStatus,
  } as const;

  const data = await bff<AnnotationTasksListResponseDto>(`/annotations/task`, {
    method: 'GET',
    query,
  });

  return mapAnnotationTasksListResponseDtoToPage(data);
}
