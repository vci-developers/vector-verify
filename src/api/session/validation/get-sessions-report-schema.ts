import { z } from 'zod';
import { sessionTypeSchema } from './session-schema';
import { arrayQueryParamSchema } from '@/lib/network/validation/array-query-param-schema';

export const getSessionsReportQueryParamsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sessionType: sessionTypeSchema.optional(),
    programId: z.coerce.number().optional(),
    districts: arrayQueryParamSchema.optional(),
    siteIds: arrayQueryParamSchema.optional(),
});

export type GetSessionsReportQueryParams = z.infer<
    typeof getSessionsReportQueryParamsSchema
>;
