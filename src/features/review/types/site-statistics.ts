import type { SpecimensQuery } from './query';

export interface SiteStatisticsProps {
  siteId: number;
  queryParameters: SpecimensQuery;
  enabled?: boolean;
}

export interface SiteStatisticsData {
  totalSpecimens: number;
  totalImages: number;
  isLoading: boolean;
  isPartial: boolean;
}

export interface BatchedSiteStatisticsProps {
  siteIds: number[];
  queryParameters: SpecimensQuery;
  enabled?: boolean;
}

export interface BatchedSiteStatisticsData {
  statisticsMap: Map<number, SiteStatisticsData>;
  isLoading: boolean;
}

