import z from 'zod';
import { dhis2SyncTaskSchema } from './dhis2-sync-task-schema';

export const getDhis2SyncTasksResponseSchema = z.object({
    success: z.boolean(),
    tasks: z.array(dhis2SyncTaskSchema),
});

export const getDhis2SyncTasksQueryParamsSchema = z.object({
    collectionCycleId: z.coerce.number(),
    siteId: z.coerce.number(),
});

export type GetDhis2SyncTasksQueryParams = z.infer<
    typeof getDhis2SyncTasksQueryParamsSchema
>;

export type GetDhis2SyncTasksResponseBody = z.infer<
    typeof getDhis2SyncTasksResponseSchema
>;
export type GetDhis2SyncTasksSuccessPayload = GetDhis2SyncTasksResponseBody;
