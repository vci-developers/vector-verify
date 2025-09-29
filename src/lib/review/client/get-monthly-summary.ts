import type {
  MonthlySummary,
  MonthlySummaryFilters,
  MonthlySummaryResponse,
} from '../types';
import bff from '@/lib/shared/http/client/bff-client';

export async function getMonthlySummary(
  filters: MonthlySummaryFilters = {},
): Promise<MonthlySummaryResponse> {
  const { dateFrom, dateTo, districts } = filters;

  const query = {
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(districts &&
      districts.length > 0 && { districts: districts.join(',') }),
  };

  console.log('Fetching monthly summary with query:', query);

  const data = await bff<MonthlySummaryResponse>('/sessions/monthly-summary', {
    method: 'GET',
    query,
  });

  console.log('Monthly summary response:', data);

  return data;
}
