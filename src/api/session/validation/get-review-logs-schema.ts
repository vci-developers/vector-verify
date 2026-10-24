import { z } from 'zod';

export const getReviewLogsQueryParamsSchema = z.object({
    siteId: z.coerce.number().optional(),
    collectionCycleId: z.coerce.number().optional(),
    specimenId: z.coerce.number().optional(),
    action: z.string().optional(),
    hasChanges: z.enum(['true', 'false']).optional(),
});

export const reviewLogSchema = z.object({
    id: z.number(),
    specimenId: z.number().nullish(),
    performedBy: z
        .object({ userId: z.number(), name: z.string().nullable() })
        .nullish(),
    fields: z.record(z.string(), z.unknown()).nullish(),
    changes: z.record(z.string(), z.unknown()).nullish(),
    metadata: z.record(z.string(), z.unknown()).nullish(),
    createdAt: z.number(),
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
export const getAllReviewLogsResponseSchema = z.object({
    logs: z.array(reviewLogSchema),
});
export type GetReviewLogsQueryParams = z.infer<
    typeof getReviewLogsQueryParamsSchema
>;
export type GetAllReviewLogsResponse = z.infer<
    typeof getAllReviewLogsResponseSchema
>;
export type ReviewLog = z.infer<typeof reviewLogSchema>;
