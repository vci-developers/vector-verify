import { z } from 'zod';
import { annotationSchema } from '@/api/annotation/validation/annotation-schema';

export const getAnnotationsQueryParamsSchema = z.object({
    taskId: z.coerce.number().optional(),
    annotatorId: z.coerce.number().optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
})

export const getAnnotationsSchema = z.object({
    annotations: z.array(annotationSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export type GetAnnotationsQueryParams = z.infer<
    typeof getAnnotationsQueryParamsSchema
>;
export type GetAnnotationsResponseBody = z.infer<typeof getAnnotationsSchema>;

export type GetAnnotationsSuccessPayload = GetAnnotationsResponseBody;