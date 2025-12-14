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
    includeAllImages,
    sessionType = 'SURVEILLANCE',
  } = filters;

  const query: SpecimensRequestDto = {
    sessionType,
  };

  if (offset !== undefined) query.offset = offset;
  if (limit !== undefined) query.limit = limit;
  if (startDate) query.startDate = startDate;
  if (endDate) query.endDate = endDate;
  if (district) query.district = district;
  if (siteId) query.siteId = siteId;
  if (species) query.species = species;
  if (sex) query.sex = sex;
  if (abdomenStatus) query.abdomenStatus = abdomenStatus;
  if (includeAllImages === true) query.includeAllImages = true;

  const data = await bff<SpecimensListResponseDto>('/specimens', {
    method: 'GET',
    query: query as Record<
      string,
      string | number | boolean | null | undefined
    >,
  });

  return mapSpecimenExpandedDtoToPage(data);
}
