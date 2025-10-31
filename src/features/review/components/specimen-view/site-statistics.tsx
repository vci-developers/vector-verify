'use client';

import { useMemo } from 'react';
import { useSpecimensQuery } from '@/features/review/hooks/use-specimens';
import type { SpecimensQuery } from '@/features/review/types';

interface SiteStatisticsProps {
  siteId: number;
  queryParameters: SpecimensQuery;
  enabled?: boolean;
}

interface SiteStatisticsData {
  totalSpecimens: number;
  totalImages: number;
  isLoading: boolean;
}

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
  };
}
