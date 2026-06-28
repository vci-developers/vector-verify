import type { Dhis2SyncTask } from '@/api/dhis2/validation/dhis2-sync-task-schema';
import type { Dhis2SyncSiteStatus } from './dhis2-sync-site-status';

export function rollUpDhis2SyncStatus(
    isSiteFullySubmittedToDhis2: boolean,
    latestTask?: Dhis2SyncTask,
): Dhis2SyncSiteStatus {
    if (latestTask?.status === 'pending') return 'queued';
    if (latestTask?.status === 'running') return 'running';

    if (latestTask) {
        switch (latestTask.status) {
            case 'failed':
                return 'failed';
            case 'timed_out':
                return 'timedOut';
            case 'completed': {
                const summary = latestTask.result?.summary;
                if ((summary?.failedSyncs ?? 0) > 0) return 'failed';
                if ((summary?.skippedHouseholds ?? 0) > 0) return 'skipped';
                return isSiteFullySubmittedToDhis2
                    ? 'submitted'
                    : 'hasNewCertifiedData';
            }
        }
    }

    return isSiteFullySubmittedToDhis2 ? 'submitted' : 'ready';
}
