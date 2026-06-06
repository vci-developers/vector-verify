import type { Dhis2SyncTask } from '@/api/dhis2/validation/dhis2-sync-task-schema';
import type { Dhis2SyncSiteStatus } from './dhis2-sync-site-status';

export function rollUpDhis2SyncStatus(
    isSiteFullyReviewed: boolean,
    isSiteFullySubmittedToDhis2: boolean,
    latestTask?: Dhis2SyncTask,
): Dhis2SyncSiteStatus {
    if (latestTask?.status === 'pending') return 'queued';
    if (latestTask?.status === 'running') return 'running';

    if (!isSiteFullyReviewed) return 'reviewPending';

    if (latestTask) {
        switch (latestTask.status) {
            case 'failed':
                return 'failed';
            case 'timed_out':
                return 'timedOut';
            case 'completed': {
                const failedSyncs =
                    latestTask.result?.summary?.failedSyncs ?? 0;
                if (failedSyncs > 0) return 'failed';
                return isSiteFullySubmittedToDhis2
                    ? 'submitted'
                    : 'hasNewCertifiedData';
            }
        }
    }

    return isSiteFullySubmittedToDhis2 ? 'submitted' : 'ready';
}
