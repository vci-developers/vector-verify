import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  getDashboardMetrics,
  getSpecimenCounts,
  dashboardKeys,
} from '@/features/review/api';
import type { DashboardMetrics } from '@/features/review/types/model';
import type { DashboardMetricsRequestDto } from '@/features/review/types/request.dto';
import type { DashboardMetricsQueryKey } from '@/features/review/api/dashboard-keys';

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

      const speciesTotals = new Map<string, number>();
      let male = 0;
      let female = 0;
      let fed = 0;
      let unfed = 0;
      let gravid = 0;

      for (const site of specimenCounts.data) {
        for (const specimenCount of site.counts) {
          const species = (specimenCount.species ?? '').trim();
          const sex = (specimenCount.sex ?? '').toLowerCase();
          const abdomen = (specimenCount.abdomenStatus ?? '').toLowerCase();

          if (species) {
            speciesTotals.set(
              species,
              (speciesTotals.get(species) ?? 0) + specimenCount.count,
            );
          }
          if (sex === 'male') male += specimenCount.count;
          if (sex === 'female') female += specimenCount.count;

          // Only count abdomen status for female mosquitoes
          if (sex === 'female' && abdomen) {
            if (abdomen === 'fully fed') {
              fed += specimenCount.count;
            } else if (abdomen === 'unfed') {
              unfed += specimenCount.count;
            } else if (abdomen === 'gravid') {
              gravid += specimenCount.count;
            }
          }
        }
      }

      const speciesDistribution = Array.from(speciesTotals.entries())
        .map(([speciesName, speciesCount]) => ({
          species: speciesName,
          count: speciesCount,
        }))
        .sort((first, second) => second.count - first.count);

      const safeTotalSex = male + female;
      const sexDistribution = {
        total: safeTotalSex,
        male: {
          count: male,
          percentage: safeTotalSex
            ? Math.round((male / safeTotalSex) * 100)
            : 0,
        },
        female: {
          count: female,
          percentage: safeTotalSex
            ? Math.round((female / safeTotalSex) * 100)
            : 0,
        },
      } as const;

      // Total should match female count (all female mosquitoes)
      const safeTotalAbdomen = female;
      const abdomenStatusDistribution = {
        total: safeTotalAbdomen,
        fed: {
          count: fed,
          percentage: safeTotalAbdomen
            ? Math.round((fed / safeTotalAbdomen) * 100)
            : 0,
        },
        unfed: {
          count: unfed,
          percentage: safeTotalAbdomen
            ? Math.round((unfed / safeTotalAbdomen) * 100)
            : 0,
        },
        gravid: {
          count: gravid,
          percentage: safeTotalAbdomen
            ? Math.round((gravid / safeTotalAbdomen) * 100)
            : 0,
        },
      } as const;

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
