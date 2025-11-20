import type { MonthlySummary, MonthlySummaryQuery, MonthlySummaryResponseDto } from '@/features/review/types';
import type { MonthlySummaryRequestDto } from '@/features/review/types/request.dto';
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
  const {
    startDate,
    endDate,
    district,
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    type = 'SURVEILLANCE',
  } = filters;

  const requestDto: MonthlySummaryRequestDto = {
    type,
  };

  if (offset !== undefined) requestDto.offset = offset;
  if (limit !== undefined) requestDto.limit = limit;
  if (startDate) requestDto.startDate = startDate;
  if (endDate) requestDto.endDate = endDate;
  if (district) requestDto.district = district;

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
