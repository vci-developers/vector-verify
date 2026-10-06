import type { GetAllReviewLogsQueryParams } from '@/api/review-log/validation/get-all-review-logs-schema';

export const reviewLogKeys = {
    root: ['review-logs'] as const,
    allReviewLogs: (queryParams: GetAllReviewLogsQueryParams) =>
        ['review-logs', 'all', queryParams] as const,
};
