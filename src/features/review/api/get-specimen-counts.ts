import bff from '@/shared/infra/api/bff-client';
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
  const {
    district,
    startDate,
    endDate,
    sessionId,
    sessionType = 'SURVEILLANCE',
  } = filters;

  const query: SpecimenCountsRequestDto = {
    sessionType,
  };

  if (district) query.district = district;
  if (startDate) query.startDate = startDate;
  if (endDate) query.endDate = endDate;
  if (sessionId) query.sessionId = sessionId;

  const response = await bff<SpecimenCountsResponseDto>('/specimens/count', {
    method: 'GET',
    query: query as Record<string, string>,
  });

  return mapSpecimenCountsResponseDtoToModel(response);
}
