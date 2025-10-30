import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getDashboardMetrics, getSpecimenCounts } from '@/features/review/api';
import type { DashboardMetrics } from '@/features/review/types/model';
import type { DashboardMetricsRequestDto } from '@/features/review/types/request.dto';
import type { SpecimenCountsQuery } from '@/features/review/types';

export function useDashboardDataQuery(
  request: DashboardMetricsRequestDto,
  options?: Omit<
    UseQueryOptions<DashboardMetrics, Error, DashboardMetrics, string[]>,
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
      const [metrics, specimenCounts] = await Promise.all([
        getDashboardMetrics(request),
        getSpecimenCounts({
          district: request.district,
          startDate: request.startDate,
          endDate: request.endDate,
        }),
      ]);

      // Minimal shaping from specimenCounts to chart-friendly props
      const speciesTotals = new Map<string, number>();
      let male = 0;
      let female = 0;
      let fed = 0;
      let unfed = 0;
      let gravid = 0;
      let total = 0;

      for (const site of specimenCounts.data) {
        total += site.totalSpecimens ?? 0;
        for (const c of site.counts) {
          const species = (c.species ?? '').trim();
          const sex = (c.sex ?? '').toLowerCase();
          const abdomen = (c.abdomenStatus ?? '').toLowerCase();

          if (species) {
            speciesTotals.set(
              species,
              (speciesTotals.get(species) ?? 0) + c.count,
            );
          }
          if (sex === 'male') male += c.count;
          if (sex === 'female') female += c.count;
          if (abdomen === 'fed') fed += c.count;
          if (abdomen === 'unfed') unfed += c.count;
          if (abdomen === 'gravid') gravid += c.count;
        }
      }

      const speciesDistribution = Array.from(speciesTotals.entries())
        .map(([species, count]) => ({ species, count }))
        .sort((a, b) => b.count - a.count);

      const safeTotalSex = male + female;
      const sexRatio = {
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

      const safeTotalAbdomen = fed + unfed + gravid;
      const abdomenStatus = {
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
        sexRatio,
        abdomenStatus,
      } as DashboardMetrics;
    },
    ...options,
  });
}
