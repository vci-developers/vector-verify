import { z } from 'zod';
import { annotationStatusSchema } from './annotation-schema';

export const getAnnotationsExportQueryParamsSchema = z.object({
    programId: z.coerce.number(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    annotationTaskId: z.coerce.number().optional(),
    annotatorId: z.coerce.number().optional(),
    status: annotationStatusSchema.optional(),
    siteId: z.coerce.number().optional(),
    district: z.string().optional(),
});

export type GetAnnotationsExportQueryParams = z.infer<
    typeof getAnnotationsExportQueryParamsSchema
>;
