import type { GetSessionsQueryParams } from '@/api/session/validation/get-sessions-schema';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';
import type { GetSessionsMetricsQueryParams } from '@/api/session/validation/get-sessions-metrics-schema';

export const sessionKeys = {
    root: ['sessions'] as const,
    sessionById: (sessionId: number) => ['sessions', sessionId] as const,
    sessions: (queryParams?: GetSessionsQueryParams) =>
        ['sessions', queryParams] as const,
    allSessions: (queryParams: GetAllSessionsQueryParams) =>
        ['sessions', 'all', queryParams] as const,
    sessionsMetricsByDistrict: (queryParams: GetSessionsMetricsQueryParams) =>
        ['sessions', 'metrics', queryParams] as const,
};
