import { z } from 'zod';
import {
    reviewLogActionSchema,
    reviewLogSchema,
} from '@/api/review-log/validation/review-log-schema';

export const getAllReviewLogsQueryParamsSchema = z.object({
    siteId: z.coerce.number(),
    action: reviewLogActionSchema.optional(),
});

export const getAllReviewLogsResponseSchema = z.object({
    message: z.string(),
    logs: z.array(reviewLogSchema),
});

export type GetAllReviewLogsQueryParams = z.infer<
    typeof getAllReviewLogsQueryParamsSchema
>;
export type GetAllReviewLogsResponseBody = z.infer<
    typeof getAllReviewLogsResponseSchema
>;

export type GetAllReviewLogsSuccessPayload = GetAllReviewLogsResponseBody;
