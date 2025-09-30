import type {
  MonthlySummary,
  MonthlySummaryFilters,
  MonthlySummaryResponseDto,
} from '../types';
import { mapMonthlySummaryResponseDtoToPage } from '../types';
import type { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/shared/http/client/bff-client';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export async function getMonthlySummary(
  filters: MonthlySummaryFilters = {},
): Promise<{
  data: OffsetPage<MonthlySummary>;
  availableDistricts: Array<{ name: string; hasData: boolean }>;
}> {
  const {
    dateFrom,
    dateTo,
    district,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
  } = filters;

  const query = {
    page,
    limit,
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(district && { district }),
  };

  const response = await bff<MonthlySummaryResponseDto>(
    '/sessions/monthly-summary',
    {
      method: 'GET',
      query,
    },
  );

  return {
    data: mapMonthlySummaryResponseDtoToPage(response),
    availableDistricts: response.availableDistricts,
  };
}
