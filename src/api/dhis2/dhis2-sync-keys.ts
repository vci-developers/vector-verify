import type { GetDhis2SyncTasksQueryParams } from './validation/get-dhis2-sync-tasks-schema';

export const dhis2SyncKeys = {
    root: ['dhis2-sync-tasks'] as const,
    syncTasks: (queryParams: GetDhis2SyncTasksQueryParams) =>
        ['dhis2-sync-tasks', queryParams] as const,
};
