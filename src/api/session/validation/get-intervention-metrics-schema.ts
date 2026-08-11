import { z } from 'zod';
import { arrayQueryParamSchema } from '@/lib/network/validation/array-query-param-schema';

export const sessionMetricsQueryParamsSchema = z.object({
    district: z.string(),
    startDate: z.string(),
    endDate: z.string(),
});

export const sessionMetricsResponseSchema = z.object({
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

export const getInterventionMetricsQueryParamsSchema = z.object({
    districts: arrayQueryParamSchema,
    startDate: z.string(),
    endDate: z.string(),
});

export const getInterventionMetricsResponseSchema = z.object({
    districtMetrics: z.array(sessionMetricsResponseSchema),
});

export type SessionMetricsQueryParams = z.infer<
    typeof sessionMetricsQueryParamsSchema
>;
export type SessionMetricsResponseBody = z.infer<
    typeof sessionMetricsResponseSchema
>;
export type GetInterventionMetricsQueryParams = z.infer<
    typeof getInterventionMetricsQueryParamsSchema
>;
export type GetInterventionMetricsResponseBody = z.infer<
    typeof getInterventionMetricsResponseSchema
>;

export type GetInterventionMetricsSuccessPayload =
    GetInterventionMetricsResponseBody;
