import { mapSpecimenExpandedDtoToPage } from '@/lib/entities/specimen';
import type { OffsetPage } from '@/lib/entities/pagination';
import type { Specimen } from '@/lib/entities/specimen/model';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';
import bff from '@/lib/api/bff-client';
import type {
  SpecimensRequestDto,
  SpecimensQuery,
} from '@/features/review/types';
import type { SpecimensListResponseDto } from '@/lib/entities/specimen/dto';


export async function getSpecimens(
  filters: SpecimensQuery = {},
): Promise<OffsetPage<Specimen>> {
  const {
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    startDate,
    endDate,
    district,
    siteId,
  } = filters;


  const query: SpecimensRequestDto = {
    ...(offset !== undefined ? { offset } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(district ? { district } : {}),
    ...(siteId ? { siteId } : {}),
  };


  const data = await bff<SpecimensListResponseDto>('/specimens', {
    method: 'GET',
    query: query as Record<string, string | number | boolean | null | undefined>,
  });


  return mapSpecimenExpandedDtoToPage(data);
}
