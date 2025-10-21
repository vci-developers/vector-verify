import type { MonthlySummary } from '@/features/review/types';
import type {
  MonthlySummaryQuery,
  MonthlySummaryRequestDto,
  MonthlySummaryResponseDto,
} from '@/features/review/types';
import { mapMonthlySummaryResponseDtoToPage } from '@/features/review/types';
import type { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/api/bff-client';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export async function getMonthlySummary(
  filters: MonthlySummaryQuery = {},
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
    ...(offset !== undefined ? { offset } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(district ? { district } : {}),
  };

  const response = await bff<MonthlySummaryResponseDto>('/sessions/review/task', {
    method: 'GET',
    query:
      requestDto as Record<string, string | number | boolean | null | undefined>,
  });

  return {
    data: mapMonthlySummaryResponseDtoToPage(response),
    availableDistricts: response.districts,
  };
}
