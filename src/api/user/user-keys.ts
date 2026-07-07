import type { GetUserActiveMetricsQueryParams } from '@/api/user/validation/get-user-active-metrics-schema';

export const userKeys = {
    permissions: () => ['user', 'permissions'] as const,
    profile: () => ['user', 'profile'] as const,
    activeMetrics: (queryParams?: GetUserActiveMetricsQueryParams) =>
        ['user', 'active-metrics', queryParams] as const,
};
