import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  getDashboardMetrics,
  getDashboardSpecimenData,
} from '@/features/review/api';
import type {
  CompleteDashboardData,
  DashboardMetricsRequest,
} from '@/features/review/types/dashboard';

export function useDashboardDataQuery(
  request: DashboardMetricsRequest,
  options?: Omit<
    UseQueryOptions<
      CompleteDashboardData,
      Error,
      CompleteDashboardData,
      string[]
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: [
      'dashboard',
      request.district,
      request.startDate,
      request.endDate,
    ],
    queryFn: async () => {
      const [metrics, specimenData] = await Promise.all([
        getDashboardMetrics(request),
        getDashboardSpecimenData(request),
      ]);

      return {
        ...metrics,
        ...specimenData,
      } as CompleteDashboardData;
    },
    ...options,
  });
}
