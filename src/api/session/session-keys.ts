import type { GetSessionsQueryParams } from '@/api/session/validation/get-sessions-schema';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';

export const sessionKeys = {
    root: ['sessions'] as const,
    sessionById: (sessionId: number) => ['sessions', sessionId] as const,
    sessions: (queryParams?: GetSessionsQueryParams) =>
        ['sessions', queryParams] as const,
    allSessions: (queryParams: GetAllSessionsQueryParams) =>
        ['sessions', 'all', queryParams] as const,
};
