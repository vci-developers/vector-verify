import { sessionTypeSchema } from '@/api/session/validation/session-schema';
import { z } from 'zod';

export const getSpecimensExportQueryParamsSchema = z.object({
    programId: z.coerce.number(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sessionId: z.coerce.number().optional(),
    sessionFrontendId: z.uuid().optional(),
    sessionType: sessionTypeSchema.optional(),
    siteId: z.coerce.number().optional(),
    district: z.string().optional(),
    includeInferenceResult: z.coerce.boolean().optional(),
});

export type GetSpecimensExportQueryParams = z.infer<
    typeof getSpecimensExportQueryParamsSchema
>;
