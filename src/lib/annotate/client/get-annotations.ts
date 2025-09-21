import {
  mapAnnotationsListResponseDtoToPage,
  type Annotation,
} from '@/lib/entities/annotation';
import type { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/shared/http/client/bff-client';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';
import type { AnnotationsListFilters } from '@/lib/annotate/types';
import type { AnnotationsListResponseDto } from '@/lib/entities/annotation/dto';

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
