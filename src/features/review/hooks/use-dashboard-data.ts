import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  getDashboardMetrics,
  getSpecimenCounts,
  dashboardKeys,
} from '@/features/review/api';
import type { DashboardMetricsQueryKey } from '@/features/review/api/dashboard-keys';
import type { DashboardMetrics } from '@/features/review/types/model';
import type { DashboardMetricsRequestDto } from '@/features/review/types/request.dto';
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
  const type: 'SURVEILLANCE' | 'DATA_COLLECTION' =
    (request.type as 'SURVEILLANCE' | 'DATA_COLLECTION' | undefined) ??
    'SURVEILLANCE';

  return useQuery({
    queryKey: dashboardKeys.metrics(
      request.district,
      request.startDate,
      request.endDate,
      type,
    ),
    queryFn: async () => {
      const [metrics, specimenCounts] = await Promise.all([
        getDashboardMetrics({ ...request, type }),
        getSpecimenCounts({
          district: request.district,
          startDate: request.startDate,
          endDate: request.endDate,
          sessionType: type,
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
