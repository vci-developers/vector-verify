import { z } from 'zod';
import { sessionTypeSchema } from './session-schema';

export const getSessionsReportQueryParamsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sessionType: sessionTypeSchema.optional(),
    programId: z.coerce.number().optional(),
    districts: z.string().optional(),
    siteIds: z.string().optional(),
});

export type GetSessionsReportQueryParams = z.infer<
    typeof getSessionsReportQueryParamsSchema
>;
