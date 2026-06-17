import z from 'zod';
import {
    dhis2SyncSiteResultSchema,
    dhis2SyncSummarySchema,
} from './dhis2-sync-result-schema';
import { siteIrsDataSchema } from './post-dhis2-sync-task-schema';
import { booleanQueryParamSchema } from '@/lib/network/validation/boolean-query-param-schema';

export const postDhis2SyncDryRunQueryParamsSchema = z.object({
    collectionCycleId: z.coerce.number(),
    siteId: z.coerce.number(),
    dryRun: booleanQueryParamSchema(true),
});

export const postDhis2SyncDryRunRequestSchema = z.object({
    irsData: z.array(siteIrsDataSchema).optional(),
});

export const postDhis2SyncDryRunResponseSchema = z.object({
    success: z.boolean().optional(),
    summary: dhis2SyncSummarySchema.optional(),
    results: z.array(dhis2SyncSiteResultSchema).optional(),
});

export type PostDhis2SyncDryRunQueryParams = z.infer<
    typeof postDhis2SyncDryRunQueryParamsSchema
>;
export type PostDhis2SyncDryRunRequestBody = z.infer<
    typeof postDhis2SyncDryRunRequestSchema
>;
export type PostDhis2SyncDryRunResponseBody = z.infer<
    typeof postDhis2SyncDryRunResponseSchema
>;
export type PostDhis2SyncDryRunSuccessPayload = PostDhis2SyncDryRunResponseBody;
