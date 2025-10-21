import {
  AnnotationTask,
  AnnotationTasksListResponseDto,
  mapAnnotationTasksListResponseDtoToPage,
  AnnotationTasksListRequestDto,
  AnnotationTasksQuery,
} from '@/features/annotation/types';
import type { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/api/bff-client';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export async function getAnnotationTasks(
  filters: AnnotationTasksQuery = {},
): Promise<OffsetPage<AnnotationTask>> {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    startDate,
    endDate,
  } = filters;

  const query: AnnotationTasksListRequestDto = {
    ...(page !== undefined ? { page } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const data = await bff<AnnotationTasksListResponseDto>('/annotations/task', {
    method: 'GET',
    query:
      query as unknown as Record<string, string | number | boolean | null | undefined>,
  });

  return mapAnnotationTasksListResponseDtoToPage(data);
}
