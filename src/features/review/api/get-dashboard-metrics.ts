import bff from '@/shared/infra/api/bff-client';
import type {
  DashboardMetrics,
  DashboardMetricsRequest,
  DashboardMetricsResponse,
} from '@/features/review/types/dashboard';

export async function getDashboardMetrics(
  request: DashboardMetricsRequest,
): Promise<DashboardMetrics> {
  const { district, startDate, endDate } = request;

  const response = await bff<DashboardMetricsResponse>('/sessions/metrics', {
    method: 'GET',
    query: {
      district,
      startDate,
      endDate,
    },
  });

  return response;
}
