import { z } from 'zod';

export const getAnnotationsSummaryQueryParamsSchema = z.object({
    district: z.string().optional(),
    siteId: z.coerce.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const annotationConfusionMatrixSchema = z.object({
    columns: z.array(z.string()),
    data: z.array(
        z.object({
            rowLabel: z.string(),
            values: z.record(z.string(), z.number()),
        }),
    ),
});

export const getAnnotationsSummaryResponseSchema = z.object({
    total: z.number(),
    statusCounts: z.object({
        PENDING: z.number(),
        ANNOTATED: z.number(),
        FLAGGED: z.number(),
    }),
    confusionMatrices: z
        .object({
            species: annotationConfusionMatrixSchema.optional(),
            sex: annotationConfusionMatrixSchema.optional(),
            abdomenStatus: annotationConfusionMatrixSchema.optional(),
        })
        .optional(),
});

export type GetAnnotationsSummaryQueryParams = z.infer<
    typeof getAnnotationsSummaryQueryParamsSchema
>;
export type GetAnnotationsSummaryResponseBody = z.infer<
    typeof getAnnotationsSummaryResponseSchema
>;
export type GetAnnotationsSummarySuccessPayload =
    GetAnnotationsSummaryResponseBody;
export type AnnotationConfusionMatrix = z.infer<
    typeof annotationConfusionMatrixSchema
>;
