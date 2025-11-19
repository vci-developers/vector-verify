import type { MonthlySummary, MonthlySummaryQuery, MonthlySummaryResponseDto } from '@/features/review/types';
import { mapMonthlySummaryResponseDtoToPage } from '@/features/review/types';
import type { OffsetPage } from '@/shared/entities/pagination';
import bff from '@/shared/infra/api/bff-client';
import { DEFAULT_PAGE_SIZE } from '@/shared/entities/pagination';

export async function getMonthlySummary(
  filters: MonthlySummaryQuery = {},
): Promise<{
  data: OffsetPage<MonthlySummary>;
  availableDistricts: string[];
}> {
  const { district, offset = 0, limit = DEFAULT_PAGE_SIZE } = filters;

  const query: Record<string, string | number> = {
    offset,
    limit,
  };

  if (district) {
    query.district = district;
  }

  const response = await bff<MonthlySummaryResponseDto>('/sessions/review/task', {
    method: 'GET',
    query,
  });

  return {
    data: mapMonthlySummaryResponseDtoToPage(response),
    availableDistricts: response.districts,
  };
}
