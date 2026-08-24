import { z } from 'zod';

export const getSessionsMetricsQueryParamsSchema = z.object({
    district: z.string(),
    startDate: z.string(),
    endDate: z.string(),
});

export const getSessionsMetricsResponseSchema = z.object({
    siteInformation: z.object({
        housesUsedForCollection: z.number().nullable().optional(),
        peopleInAllHousesInspected: z.number().nullable().optional(),
    }),
    entomologicalSummary: z.object({
        totalFedAnopheles: z.number().nullable().optional(),
        malariaVectorDensity: z.number().nullable().optional(),
        fedAnophelesToPeopleSleptRatio: z.number().nullable().optional(),
        totalLlins: z.number().nullable().optional(),
        totalPeopleSleptUnderLlin: z.number().nullable().optional(),
        llinsPerPerson: z.number().nullable().optional(),
        vectorDensity: z.number().nullable().optional(),
        fedMosquitoesToPeopleSleptRatio: z.number().nullable().optional(),
    }),
});

export type GetSessionsMetricsQueryParams = z.infer<
    typeof getSessionsMetricsQueryParamsSchema
>;
export type GetSessionsMetricsResponseBody = z.infer<
    typeof getSessionsMetricsResponseSchema
>;
