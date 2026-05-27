import { z } from 'zod';

export const collectionScheduleSchema = z.object({
    id: z.number(),
    programId: z.number(),
    cadenceType: z.enum(['RECURRING', 'MANUAL']),
    intervalUnit: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']).nullable(),
    intervalCount: z.number().nullable(),
    effectiveStartDate: z.number(),
    effectiveEndDate: z.number().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export const collectionCycleSchema = z.object({
    id: z.number(),
    programId: z.number(),
    collectionScheduleId: z.number(),
    cycleNumber: z.number(),
    startDate: z.number(),
    endDate: z.number(),
    createdAt: z.number(),
    updatedAt: z.number(),
    collectionSchedule: collectionScheduleSchema,
});

export const getCollectionCyclesQueryParamsSchema = z.object({
    programId: z.coerce.number(),
    startDate: z.string(),
    endDate: z.string(),
});

export const getCollectionCyclesResponseSchema = z.object({
    collectionCycles: z.array(collectionCycleSchema),
});

export type CollectionSchedule = z.infer<typeof collectionScheduleSchema>;
export type CollectionCycle = z.infer<typeof collectionCycleSchema>;
export type GetCollectionCyclesQueryParams = z.infer<
    typeof getCollectionCyclesQueryParamsSchema
>;
export type GetCollectionCyclesResponseBody = z.infer<
    typeof getCollectionCyclesResponseSchema
>;
export type GetCollectionCyclesSuccessPayload = GetCollectionCyclesResponseBody;
