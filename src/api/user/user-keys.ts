import type { GetAllUserActiveMetricsQueryParams } from '@/api/user/validation/get-all-user-active-metrics-schema';

export const userKeys = {
    permissions: () => ['user', 'permissions'] as const,
    profile: () => ['user', 'profile'] as const,
    allActiveMetrics: (queryParams: GetAllUserActiveMetricsQueryParams) =>
        ['user', 'active-metrics', 'all', queryParams] as const,
};
