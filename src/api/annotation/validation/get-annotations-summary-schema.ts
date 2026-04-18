import { z } from 'zod';

export const getAnnotationsSummaryQueryParamsSchema = z.object({
    district: z.string().optional(),
    siteId: z.coerce.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const getAnnotationsSummaryResponseSchema = z.object({
    total: z.number(),
    statusCounts: z
        .object({
            PENDING: z.number().default(0),
            ANNOTATED: z.number().default(0),
            FLAGGED: z.number().default(0),
        })
        .default({ PENDING: 0, ANNOTATED: 0, FLAGGED: 0 }),
    confusionMatrices: z.unknown().optional(),
});

export type GetAnnotationsSummaryQueryParams = z.infer<
    typeof getAnnotationsSummaryQueryParamsSchema
>;
export type GetAnnotationsSummaryResponseBody = z.infer<
    typeof getAnnotationsSummaryResponseSchema
>;
export type GetAnnotationsSummarySuccessPayload =
    GetAnnotationsSummaryResponseBody;
