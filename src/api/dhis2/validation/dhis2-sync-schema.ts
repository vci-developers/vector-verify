import { z } from 'zod';

export const dhis2SyncDataValueSchema = z.object({
    displayName: z.string(),
    dataElementId: z.string(),
    value: z.unknown(),
});

export const dhis2SyncResultSchema = z.object({
    siteId: z.number(),
    houseNumber: z.string().optional(),
    healthCenter: z.string().optional(),
    status: z.enum(['success', 'failed', 'skipped']),
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

export type Dhis2SyncResult = z.infer<typeof dhis2SyncResultSchema>;
export type Dhis2SyncSummary = z.infer<typeof dhis2SyncSummarySchema>;
export type Dhis2ExportSiteStatus = Dhis2SyncResult['status'];
