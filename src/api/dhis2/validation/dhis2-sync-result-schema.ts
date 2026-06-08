import { z } from 'zod';

const dhis2SyncSiteResultStatusSchema = z.enum([
    'success',
    'failed',
    'skipped',
]);

const dhis2SyncDataValueSchema = z.object({
    displayName: z.string(),
    dataElementId: z.string(),
    value: z.unknown(),
});

export const dhis2SyncSiteResultSchema = z.object({
    siteId: z.number(),
    houseNumber: z.string().optional(),
    healthCenter: z.string().optional(),
    status: dhis2SyncSiteResultStatusSchema,
    message: z.string().optional(),
    teiId: z.string().optional(),
    eventId: z.string().optional(),
    dataValuesCount: z.number().optional(),
    dataValues: z.array(dhis2SyncDataValueSchema).optional(),
});

export const dhis2SyncSummarySchema = z.object({
    totalHouseholds: z.number(),
    successfulSyncs: z.number(),
    failedSyncs: z.number(),
    skippedHouseholds: z.number(),
});

export type Dhis2SyncSiteResultStatus = z.infer<
    typeof dhis2SyncSiteResultStatusSchema
>;
export type Dhis2SyncSiteResult = z.infer<typeof dhis2SyncSiteResultSchema>;
export type Dhis2SyncSummary = z.infer<typeof dhis2SyncSummarySchema>;
