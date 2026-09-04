import type { GetAllUserActiveMetricsQueryParams } from '@/api/user/validation/get-all-user-active-metrics-schema';
import type { GetAllUserAuthEventsQueryParams } from '@/api/user/validation/get-all-user-auth-events-schema';

export const userKeys = {
    permissions: () => ['user', 'permissions'] as const,
    profile: () => ['user', 'profile'] as const,
    allActiveMetrics: (queryParams: GetAllUserActiveMetricsQueryParams) =>
        ['user', 'active-metrics', 'all', queryParams] as const,
    allAuthEvents: (queryParams: GetAllUserAuthEventsQueryParams) =>
        ['user', 'auth-events', 'all', queryParams] as const,
    users: () => ['user', 'list'] as const,
};
