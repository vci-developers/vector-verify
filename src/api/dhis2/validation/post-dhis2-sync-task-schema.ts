import z from 'zod';
import { dhis2SyncTaskStatusSchema } from './dhis2-sync-task-schema';

const irsInsecticideSchema = z.enum([
    'Actellic 300C',
    'Sumishield',
    'Flodora Fusion',
    'Bendio Carb',
    'Alpha Cyhalothrin(Fendona)',
    'Icon Labdacyhalothrin',
    'DDT',
    'Pirimiphosmethyl',
    'Clothiacid',
]);

export const siteIrsDataSchema = z.object({
    siteId: z.number(),
    wasIrsSprayed: z.boolean().optional(),
    insecticideSprayed: irsInsecticideSchema.optional(),
    dateLastSprayed: z.string().optional(),
});

export const postDhis2SyncTaskQueryParamsSchema = z.object({
    collectionCycleId: z.coerce.number(),
    siteId: z.coerce.number(),
});

export const postDhis2SyncTaskRequestSchema = z.object({
    irsData: z.array(siteIrsDataSchema).optional(),
});

export const postDhis2SyncTaskResponseSchema = z.object({
    success: z.boolean(),
    taskId: z.uuid(),
    collectionCycleId: z.number().nullable(),
    siteId: z.number().nullable(),
    status: dhis2SyncTaskStatusSchema,
    timeoutSeconds: z.number(),
});

export type IrsInsecticide = z.infer<typeof irsInsecticideSchema>;
export type SiteIrsData = z.infer<typeof siteIrsDataSchema>;

export type PostDhis2SyncTaskQueryParams = z.infer<
    typeof postDhis2SyncTaskQueryParamsSchema
>;
export type PostDhis2SyncTaskRequestBody = z.infer<
    typeof postDhis2SyncTaskRequestSchema
>;

export type PostDhis2SyncTaskResponseBody = z.infer<
    typeof postDhis2SyncTaskResponseSchema
>;
export type PostDhis2SyncTaskSuccessPayload = PostDhis2SyncTaskResponseBody;
