import bff from '@/lib/api/bff-client';
import type {
  SpecimenCountsFilters,
  SpecimenCountsResponse,
  SpecimenCountsResponseDto,
} from '@/features/review/types';
import { mapSpecimenCountsResponseDtoToModel } from '@/features/review/types';

export async function getSpecimenCounts(
  filters: SpecimenCountsFilters,
): Promise<SpecimenCountsResponse> {
  const { district, startDate, endDate } = filters;

  const query = {
    ...(district ? { district } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  } as Record<string, string>;

  const response = await bff<SpecimenCountsResponseDto>('/specimens/count', {
    method: 'GET',
    query,
  });

  return mapSpecimenCountsResponseDtoToModel(response);
}
