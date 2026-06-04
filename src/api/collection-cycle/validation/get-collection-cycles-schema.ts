import { z } from 'zod';
import { collectionCycleSchema } from '@/api/collection-cycle/validation/collection-cycle-schema';

export const getCollectionCyclesQueryParamsSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
});

export const getCollectionCyclesResponseSchema = z.object({
    collectionCycles: z.array(collectionCycleSchema),
});

export type GetCollectionCyclesQueryParams = z.infer<
    typeof getCollectionCyclesQueryParamsSchema
>;
export type GetCollectionCyclesResponseBody = z.infer<
    typeof getCollectionCyclesResponseSchema
>;
export type GetCollectionCyclesSuccessPayload = GetCollectionCyclesResponseBody;
