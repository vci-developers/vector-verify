import {
  mapAnnotationsListResponseDtoToPage,
  type Annotation,
} from '@/features/annotation/types';
import type { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/api/bff-client';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';
import type { AnnotationsListFilters } from '@/features/annotation/types';
import type { AnnotationsListResponseDto } from '@/features/annotation/types/dto';

export async function getAnnotations(
  filters: AnnotationsListFilters,
): Promise<OffsetPage<Annotation>> {
  const {
    taskId,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    status,
  } = filters;

  const query = {
    taskId,
    page,
    limit,
    status,
  };

  const data = await bff<AnnotationsListResponseDto>('/annotations', {
    method: 'GET',
    query,
  });
  return mapAnnotationsListResponseDtoToPage(data);
}
