import { z } from 'zod';
import {
    dhis2SyncResultSchema,
    dhis2SyncSummarySchema,
} from './dhis2-sync-schema';

export const postDhis2ExportQueryParamsSchema = z.object({
    year: z.coerce.number(),
    month: z.coerce.number(),
    district: z.string(),
    siteIds: z.string().optional(),
    dryRun: z.coerce.boolean().optional(),
});

export const postDhis2ExportResponseSchema = z.object({
    success: z.boolean(),
    year: z.number(),
    month: z.number(),
    dryRun: z.boolean().optional(),
    summary: dhis2SyncSummarySchema,
    results: z.array(dhis2SyncResultSchema),
});

export type PostDhis2ExportQueryParams = z.infer<
    typeof postDhis2ExportQueryParamsSchema
>;
export type PostDhis2ExportResponseBody = z.infer<
    typeof postDhis2ExportResponseSchema
>;
