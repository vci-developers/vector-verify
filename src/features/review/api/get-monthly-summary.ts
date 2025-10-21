import type {
  MonthlySummary,
  MonthlySummaryFilters,
} from '@/features/review/types';
import type {
  MonthlySummaryRequestDto,
  MonthlySummaryResponseDto,
} from '@/features/review/types';
import { mapMonthlySummaryResponseDtoToPage } from '@/features/review/types';
import type { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/api/bff-client';
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

  const requestDto = {
    limit,
    offset,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(district && { district }),
  } satisfies MonthlySummaryRequestDto;

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
