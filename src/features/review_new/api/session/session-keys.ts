import type { GetSessionsQueryParams } from '@/features/review_new/api/session/validation/get-sessions-schema';

export const sessionKeys = {
    sessionById: (sessionId: number) => ['sessions', sessionId] as const,
    sessions: (queryParams?: GetSessionsQueryParams) =>
        ['sessions', queryParams] as const,
};
