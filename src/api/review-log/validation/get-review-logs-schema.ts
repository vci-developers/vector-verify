import { z } from 'zod';
import {
    reviewLogActionSchema,
    reviewLogSchema,
} from '@/api/review-log/validation/review-log-schema';

export const getReviewLogsQueryParamsSchema = z.object({
    siteId: z.coerce.number().optional(),
    action: reviewLogActionSchema.optional(),
    page: z.coerce.number().min(1).optional(),
    size: z.coerce.number().min(1).max(100).optional(),
});

export const getReviewLogsResponseSchema = z.object({
    logs: z.array(reviewLogSchema),
    pagination: z.object({
        page: z.number(),
        size: z.number(),
        totalPages: z.number(),
        totalItems: z.number(),
    }),
});

export type GetReviewLogsQueryParams = z.infer<
    typeof getReviewLogsQueryParamsSchema
>;
export type GetReviewLogsResponseBody = z.infer<
    typeof getReviewLogsResponseSchema
>;

export type GetReviewLogsSuccessPayload = GetReviewLogsResponseBody;
