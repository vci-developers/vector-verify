import type { GetSessionsQueryParams } from '@/features/review_new/api/session/validation/get-sessions-schema';

export const sessionKeys = {
    sessions: (queryParams?: GetSessionsQueryParams) =>
        ['sessions', queryParams] as const,
};
