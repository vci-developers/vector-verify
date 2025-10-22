import {
  mapAnnotationsListResponseDtoToPage,
  type Annotation,
  type AnnotationsListRequestDto,
  type AnnotationsQuery,
} from '@/features/annotation/types';
import type { OffsetPage } from '@/shared/entities/pagination';
import bff from '@/shared/infra/api/bff-client';
import { DEFAULT_PAGE_SIZE } from '@/shared/entities/pagination';
import type { AnnotationsListResponseDto } from '@/features/annotation/types';

export async function getAnnotations(
  filters: AnnotationsQuery,
): Promise<OffsetPage<Annotation>> {
  const {
    taskId,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    status,
  } = filters;

  const query: AnnotationsListRequestDto = {
    taskId,
    ...(page !== undefined ? { page } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(status ? { status } : {}),
  };

  const data = await bff<AnnotationsListResponseDto>('/annotations', {
    method: 'GET',
    query: query as unknown as Record<string, string | number | boolean | null | undefined>,
  });
  return mapAnnotationsListResponseDtoToPage(data);
}
