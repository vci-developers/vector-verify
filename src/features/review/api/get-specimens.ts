import { mapSpecimenExpandedDtoToPage } from '@/shared/entities/specimen';
import type { OffsetPage } from '@/shared/entities/pagination';
import type { Specimen } from '@/shared/entities/specimen/model';
import { DEFAULT_PAGE_SIZE } from '@/shared/entities/pagination';
import bff from '@/shared/infra/api/bff-client';
import type {
  SpecimensRequestDto,
  SpecimensQuery,
} from '@/features/review/types';
import type { SpecimensListResponseDto } from '@/shared/entities/specimen/dto';


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
    species,
    sex,
    abdomenStatus,
  } = filters;


  const query: SpecimensRequestDto = {
    ...(offset !== undefined ? { offset } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(district ? { district } : {}),
    ...(siteId ? { siteId } : {}),
    ...(species ? { species } : {}),
    ...(sex ? { sex } : {}),
    ...(abdomenStatus ? { abdomenStatus } : {}),
  };


  const data = await bff<SpecimensListResponseDto>('/specimens', {
    method: 'GET',
    query: query as Record<string, string | number | boolean | null | undefined>,
  });


  return mapSpecimenExpandedDtoToPage(data);
}
