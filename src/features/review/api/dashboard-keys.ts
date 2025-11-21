import type { QueryKey } from '@tanstack/react-query';

export const dashboardKeys = {
  root: ['review', 'dashboard'] as const,
  metrics: (district: string, startDate?: string, endDate?: string, type?: string) =>
    [...dashboardKeys.root, 'metrics', { district, startDate, endDate, type }] as const,
} as const;

export type DashboardMetricsQueryKey = ReturnType<
  typeof dashboardKeys.metrics
> &
  QueryKey;

