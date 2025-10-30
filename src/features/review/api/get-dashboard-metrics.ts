import bff from '@/shared/infra/api/bff-client';
import type { DashboardMetrics } from '@/features/review/types/model';
import type { DashboardMetricsRequestDto } from '@/features/review/types/request.dto';
import type { DashboardMetricsResponseDto } from '@/features/review/types/response.dto';

export async function getDashboardMetrics(
  request: DashboardMetricsRequestDto,
): Promise<DashboardMetrics> {
  const { district, startDate, endDate } = request;

  const response = await bff<DashboardMetricsResponseDto>('/sessions/metrics', {
    method: 'GET',
    query: {
      district,
      startDate,
      endDate,
    },
  });

  return response as unknown as DashboardMetrics;
}
