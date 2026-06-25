import { z } from 'zod';
import {
    dhis2SyncSiteResultSchema,
    dhis2SyncSummarySchema,
} from './dhis2-sync-result-schema';

export const dhis2SyncTaskStatusSchema = z.enum([
    'pending',
    'running',
    'completed',
    'failed',
    'timed_out',
]);

export const dhis2SyncTaskResultSchema = z.object({
    success: z.boolean().optional(),
    summary: dhis2SyncSummarySchema.optional(),
    results: z.array(dhis2SyncSiteResultSchema).optional(),
});

export const dhis2SyncTaskSchema = z.object({
    id: z.uuid(),
    status: dhis2SyncTaskStatusSchema,
    collectionCycleId: z.number().nullable(),
    siteId: z.number().nullable(),
    startedAt: z.string().nullable(),
    finishedAt: z.string().nullable(),
    error: z.string().nullable(),
    result: dhis2SyncTaskResultSchema.nullable(),
    dryRun: z.boolean(),
    timeoutSeconds: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type Dhis2SyncTaskStatus = z.infer<typeof dhis2SyncTaskStatusSchema>;
export type Dhis2SyncTaskResult = z.infer<typeof dhis2SyncTaskResultSchema>;
export type Dhis2SyncTask = z.infer<typeof dhis2SyncTaskSchema>;
