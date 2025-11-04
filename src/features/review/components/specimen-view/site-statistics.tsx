'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useSpecimensQuery } from '@/features/review/hooks/use-specimens';
import { getSpecimens } from '@/features/review/api/get-specimens';
import {
  reviewKeys,
  type SpecimensQueryKey,
} from '@/features/review/api/review-keys';
import type {
  SiteStatisticsProps,
  SiteStatisticsData,
  BatchedSiteStatisticsProps,
  BatchedSiteStatisticsData,
} from '@/features/review/types';

const MAX_SPECIMENS_PER_REQUEST = 100;

export function useSiteStatistics({
  siteId,
  queryParameters,
  enabled = true,
}: SiteStatisticsProps): SiteStatisticsData {
  const { district, startDate, endDate, species, sex, abdomenStatus } =
    queryParameters;

  const { data, isLoading } = useSpecimensQuery(
    {
      district,
      startDate,
      endDate,
      siteId,
      offset: 0,
      limit: MAX_SPECIMENS_PER_REQUEST,
      species: species ?? undefined,
      sex: sex ?? undefined,
      abdomenStatus: abdomenStatus ?? undefined,
      includeAllImages: true,
    },
    { enabled },
  );

  const totalSpecimens = data?.total ?? 0;
  const isPartial = totalSpecimens > MAX_SPECIMENS_PER_REQUEST;

  const totalImages = useMemo(() => {
    if (!data?.items) return 0;
    return data.items.reduce(
      (sum, specimen) => sum + (specimen.images?.length ?? 0),
      0,
    );
  }, [data?.items]);

  return {
    totalSpecimens,
    totalImages,
    isLoading,
    isPartial,
  };
}

/**
 * Batched version of useSiteStatistics that fetches statistics for multiple sites
 * in parallel, avoiding N+1 query pattern.
 */
export function useBatchedSiteStatistics({
  siteIds,
  queryParameters,
  enabled = true,
}: BatchedSiteStatisticsProps): BatchedSiteStatisticsData {
  const { district, startDate, endDate, species, sex, abdomenStatus } =
    queryParameters;

  const baseEnabled =
    enabled && Boolean(district && startDate && endDate && siteIds.length > 0);

  const queries = useQueries({
    queries: siteIds.map(siteId => ({
      queryKey: reviewKeys.specimens(
        0,
        MAX_SPECIMENS_PER_REQUEST,
        startDate,
        endDate,
        district,
        siteId,
        species ?? undefined,
        sex ?? undefined,
        abdomenStatus ?? undefined,
        true, // includeAllImages
      ) as SpecimensQueryKey,
      queryFn: () =>
        getSpecimens({
          district,
          startDate,
          endDate,
          siteId,
          offset: 0,
          limit: MAX_SPECIMENS_PER_REQUEST,
          species: species ?? undefined,
          sex: sex ?? undefined,
          abdomenStatus: abdomenStatus ?? undefined,
          includeAllImages: true,
        }),
      enabled: baseEnabled,
    })),
  });

  const statisticsMap = useMemo(() => {
    const map = new Map<number, SiteStatisticsData>();

    queries.forEach((query, index) => {
      const siteId = siteIds[index];
      const data = query.data;
      
      // Check if query is still loading or fetching (no data yet)
      const isLoading = query.isLoading || query.isFetching || (!data && baseEnabled);

      const totalSpecimens = data?.total ?? 0;
      const isPartial = totalSpecimens > MAX_SPECIMENS_PER_REQUEST;

      const totalImages = data?.items
        ? data.items.reduce(
            (sum, specimen) => sum + (specimen.images?.length ?? 0),
            0,
          )
        : 0;

      map.set(siteId, {
        totalSpecimens,
        totalImages,
        isLoading,
        isPartial,
      });
    });

    return map;
  }, [queries, siteIds, baseEnabled]);

  const isLoading = queries.some(query => query.isLoading);

  return {
    statisticsMap,
    isLoading,
  };
}
