import { z } from 'zod';

export const getUserAuthEventsReportQueryParamsSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    programId: z.coerce.number().optional(),
});

export type GetUserAuthEventsReportQueryParams = z.infer<
    typeof getUserAuthEventsReportQueryParamsSchema
>;
