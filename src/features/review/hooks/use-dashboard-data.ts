import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getDashboardMetrics, getSpecimenCounts } from '@/features/review/api';
import { DashboardDataCalculator } from '@/features/review/services/dashboard-data-calculator';
import type {
  CompleteDashboardData,
  DashboardMetricsRequest,
} from '@/features/review/types/dashboard';
import type { SpecimenCountsQuery } from '@/features/review/types';

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
      // Fetch both metrics and specimen counts data
      const [metrics, specimenCounts] = await Promise.all([
        getDashboardMetrics(request),
        getSpecimenCounts({
          district: request.district,
          startDate: request.startDate,
          endDate: request.endDate,
        }),
      ]);

      // Validate data
      const validation = DashboardDataCalculator.validateData({
        metrics,
        specimenCounts,
      });
      if (!validation.isValid) {
        throw new Error(
          `Data validation failed: ${validation.errors.join(', ')}`,
        );
      }

      // Calculate all dashboard data using the calculator
      return DashboardDataCalculator.calculateDashboardData({
        metrics,
        specimenCounts,
      });
    },
    ...options,
  });
}
