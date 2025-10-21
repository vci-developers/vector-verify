import bff from '@/lib/api/bff-client';
import type { SpecimenCountsSummary } from '@/features/review/types';
import type {
  SpecimenCountsResponseDto,
  SpecimenCountsRequestDto,
  SpecimenCountsQuery,
} from '@/features/review/types';
import { mapSpecimenCountsResponseDtoToModel } from '@/features/review/types';

export async function getSpecimenCounts(
  filters: SpecimenCountsQuery,
): Promise<SpecimenCountsSummary> {
  const { district, startDate, endDate } = filters;

  const query: SpecimenCountsRequestDto = {
    ...(district ? { district } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const response = await bff<SpecimenCountsResponseDto>('/specimens/count', {
    method: 'GET',
    query: query as Record<string, string>,
  });

  return mapSpecimenCountsResponseDtoToModel(response);
}
