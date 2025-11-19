import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import {
  getDashboardMetrics,
  getSpecimenCounts,
  dashboardKeys,
} from '@/features/review/api';
import type { DashboardMetrics } from '@/features/review/types/model';
import type { DashboardMetricsRequestDto } from '@/features/review/types/request.dto';
import type { DashboardMetricsQueryKey } from '@/features/review/api/dashboard-keys';
import {
  calculateSpeciesDistribution,
  calculateAnophelesSexDistribution,
  calculateAnophelesAbdomenStatusDistribution,
} from '@/features/review/utils/dashboard';

export function useDashboardDataQuery(
  request: DashboardMetricsRequestDto,
  options?: Omit<
    UseQueryOptions<
      DashboardMetrics,
      Error,
      DashboardMetrics,
      DashboardMetricsQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: dashboardKeys.metrics(
      request.district,
      request.startDate,
      request.endDate,
    ),
    queryFn: async () => {
      const [metrics, specimenCounts] = await Promise.all([
        getDashboardMetrics(request),
        getSpecimenCounts({
          district: request.district,
          startDate: request.startDate,
          endDate: request.endDate,
        }),
      ]);

      const speciesDistribution = calculateSpeciesDistribution(specimenCounts);
      const sexDistribution = calculateAnophelesSexDistribution(specimenCounts);
      const abdomenStatusDistribution =
        calculateAnophelesAbdomenStatusDistribution(specimenCounts);

      return {
        ...metrics,
        speciesDistribution,
        sexDistribution,
        abdomenStatusDistribution,
      } as DashboardMetrics;
    },
    ...options,
  });
}
