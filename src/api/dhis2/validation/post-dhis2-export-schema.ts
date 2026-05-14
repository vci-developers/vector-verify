import { z } from 'zod';
import {
    dhis2SyncResultSchema,
    dhis2SyncSummarySchema,
} from './dhis2-sync-schema';

const dhis2ExportBaseSchema = z.object({
    year: z.number(),
    month: z.number(),
    district: z.string(),
    siteIds: z.string().optional(),
    dryRun: z.boolean().optional(),
});

export const postDhis2ExportQueryParamsSchema = dhis2ExportBaseSchema.extend({
    year: z.coerce.number(),
    month: z.coerce.number(),
    dryRun: z.coerce.boolean().optional(),
});

export const siteIrsDataSchema = z.object({
    siteId: z.number(),
    wasIrsSprayed: z.boolean(),
    insecticideSprayed: z.string().optional(),
    dateLastSprayed: z.string().optional(),
});

export const postDhis2ExportRequestSchema = dhis2ExportBaseSchema.extend({
    irsData: z.array(siteIrsDataSchema),
});

export const postDhis2ExportResponseSchema = z.object({
    success: z.boolean(),
    year: z.number(),
    month: z.number(),
    dryRun: z.boolean().optional(),
    summary: dhis2SyncSummarySchema,
    results: z.array(dhis2SyncResultSchema),
});

export type SiteIrsData = z.infer<typeof siteIrsDataSchema>;
export type PostDhis2ExportQueryParams = z.infer<
    typeof postDhis2ExportQueryParamsSchema
>;
export type PostDhis2ExportRequestBody = z.infer<
    typeof postDhis2ExportRequestSchema
>;
export type PostDhis2ExportResponseBody = z.infer<
    typeof postDhis2ExportResponseSchema
>;
