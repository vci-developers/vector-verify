import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import {
  getDashboardMetrics,
  getSpecimenCounts,
  dashboardKeys,
} from '@/features/review/api';
import type { DashboardMetrics } from '@/features/review/types/model';
import type { DashboardMetricsRequestDto } from '@/features/review/types/request.dto';
import type { DashboardMetricsQueryKey } from '@/features/review/api/dashboard-keys';

const percentage = (value: number, total: number) =>
  total ? Math.round((value / total) * 100) : 0;

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
  const type = request.type ?? 'SURVEILLANCE';

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
        }),
      ]);

      const speciesTotals = new Map<string, number>();
      let male = 0;
      let female = 0;
      let fed = 0;
      let unfed = 0;
      let gravid = 0;

      specimenCounts.data.forEach(site => {
        site.counts.forEach(entry => {
          const species = (entry.species ?? '').trim();
          const sex = (entry.sex ?? '').toLowerCase();
          const abdomen = (entry.abdomenStatus ?? '').toLowerCase();

          if (species) {
            speciesTotals.set(
              species,
              (speciesTotals.get(species) ?? 0) + entry.count,
            );
          }

          if (sex === 'male') {
            male += entry.count;
          } else if (sex === 'female') {
            female += entry.count;
            if (abdomen === 'fully fed') fed += entry.count;
            else if (abdomen === 'unfed') unfed += entry.count;
            else if (abdomen === 'gravid') gravid += entry.count;
          }
        });
      });

      const speciesDistribution = Array.from(speciesTotals.entries())
        .map(([speciesName, speciesCount]) => ({
          species: speciesName,
          count: speciesCount,
        }))
        .sort((first, second) => second.count - first.count);

      const safeTotalSex = male + female;
      const sexDistribution = {
        total: safeTotalSex,
        male: { count: male, percentage: percentage(male, safeTotalSex) },
        female: {
          count: female,
          percentage: percentage(female, safeTotalSex),
        },
      } as const;

      const safeTotalAbdomen = female;
      const abdomenStatusDistribution = {
        total: safeTotalAbdomen,
        fed: { count: fed, percentage: percentage(fed, safeTotalAbdomen) },
        unfed: {
          count: unfed,
          percentage: percentage(unfed, safeTotalAbdomen),
        },
        gravid: {
          count: gravid,
          percentage: percentage(gravid, safeTotalAbdomen),
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
