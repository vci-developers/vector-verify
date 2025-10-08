import type {
  MonthlySummary,
  MonthlySummaryFilters,
  MonthlySummaryRequestDto,
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
  availableDistricts: string[];
}> {
  const {
    startDate,
    endDate,
    district,
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
  } = filters;

  const requestDto: MonthlySummaryRequestDto = {
    limit,
    offset,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(district && { district }),
  };

  const response = await bff<MonthlySummaryResponseDto>(
    '/sessions/review/task',
    {
      method: 'GET',
      query: requestDto,
    },
  );

  return {
    data: mapMonthlySummaryResponseDtoToPage(response),
    availableDistricts: response.districts,
  };
}
