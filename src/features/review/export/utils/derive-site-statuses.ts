import type {
    Dhis2SyncResult,
    ExportSiteStatus,
} from '@/api/dhis2/validation/dhis2-sync-schema';

export function deriveSiteStatuses(
    results: Dhis2SyncResult[],
    requestedSiteIds: number[],
): Map<number, ExportSiteStatus> {
    const grouped = new Map<number, Dhis2SyncResult[]>();
    for (const result of results) {
        const entries = grouped.get(result.siteId) ?? [];
        entries.push(result);
        grouped.set(result.siteId, entries);
    }

    const statuses = new Map<number, ExportSiteStatus>();
    for (const siteId of requestedSiteIds) {
        const entries = grouped.get(siteId) ?? [];
        let status: ExportSiteStatus;
        if (entries.length === 0) {
            status = 'skipped';
        } else if (entries.some(syncResult => syncResult.status === 'failed')) {
            status = 'failed';
        } else if (
            entries.some(syncResult => syncResult.status === 'success')
        ) {
            status = 'success';
        } else {
            status = 'skipped';
        }
        statuses.set(siteId, status);
    }
    return statuses;
}
