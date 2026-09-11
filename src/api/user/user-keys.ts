import type { GetAllUserActiveMetricsQueryParams } from '@/api/user/validation/get-all-user-active-metrics-schema';
import type { GetUserAuthEventsQueryParams } from '@/api/user/validation/get-user-auth-events-schema';

export const userKeys = {
    permissions: () => ['user', 'permissions'] as const,
    profile: () => ['user', 'profile'] as const,
    allActiveMetrics: (queryParams: GetAllUserActiveMetricsQueryParams) =>
        ['user', 'active-metrics', 'all', queryParams] as const,
    authEvents: (queryParams: GetUserAuthEventsQueryParams) =>
        ['user', 'auth-events', queryParams] as const,
};
