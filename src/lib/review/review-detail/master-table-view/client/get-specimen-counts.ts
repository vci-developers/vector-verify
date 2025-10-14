import bff from '@/lib/shared/http/client/bff-client';
import type {
  SpecimenCountsFilters,
  SpecimenCountsResponse,
} from '../types';

export async function getSpecimenCounts(
  filters: SpecimenCountsFilters,
): Promise<SpecimenCountsResponse> {
  const { district, startDate, endDate } = filters;

  const query = {
    ...(district ? { district } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  } as Record<string, string>;

  return await bff<SpecimenCountsResponse>('/specimens/count', {
    method: 'GET',
    query,
  });
}
