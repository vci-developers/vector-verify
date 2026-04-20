import { sessionTypeSchema } from '@/api/session/validation/session-schema';
import { arrayQueryParamSchema } from '@/lib/network/validation/array-query-param-schema';
import { z } from 'zod';

export const getMonthlySpecimensCountQueryParamsSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    districts: arrayQueryParamSchema.optional(),
    siteIds: arrayQueryParamSchema.optional(),
    sessionType: sessionTypeSchema.optional(),
});

export const getMonthlySpecimensCountResponseSchema = z.object({
    interval: z.enum(['MONTH']),
    data: z.array(
        z.object({
            fromTimestamp: z.number(),
            toTimestamp: z.number(),
            from: z.string(),
            to: z.string(),
            species: z.record(z.string(), z.number()),
            sex: z.record(z.string(), z.number()),
            abdomenStatus: z.record(z.string(), z.number()),
            totalSpecimens: z.number(),
        }),
    ),
});

export type GetMonthlySpecimensCountQueryParams = z.infer<
    typeof getMonthlySpecimensCountQueryParamsSchema
>;
export type GetMonthlySpecimensCountResponseBody = z.infer<
    typeof getMonthlySpecimensCountResponseSchema
>;
export type GetMonthlySpecimensCountSuccessPayload =
    GetMonthlySpecimensCountResponseBody;
