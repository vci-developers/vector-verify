import { usePostDhis2Export } from '@/api/dhis2/hooks/use-post-dhis2-export';
import { sessionKeys } from '@/api/session/session-keys';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ExportSiteStatus } from '@/api/dhis2/validation/dhis2-sync-schema';
import { deriveSiteStatuses } from '../utils/derive-site-statuses';
import type { ExportBatchItem } from '../utils/build-site-irs-data';

export type ExportStatus = 'idle' | 'exporting' | 'done';

export function useExportBatch() {
    const { mutateAsync } = usePostDhis2Export();
    const queryClient = useQueryClient();

    const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
    const [exportProgress, setExportProgress] = useState<{
        completed: number;
        total: number;
    } | null>(null);
    const [exportResults, setExportResults] = useState<
        Map<string, ExportSiteStatus>
    >(new Map());

    async function runExport(items: ExportBatchItem[]) {
        setExportStatus('exporting');
        setExportResults(new Map());

        const total = items.reduce((sum, item) => sum + item.siteIds.length, 0);
        setExportProgress({ completed: 0, total });

        const newResults = new Map<string, ExportSiteStatus>();
        let completed = 0;

        try {
            for (const {
                monthKey,
                year,
                month,
                siteIds,
                district,
                irsData,
            } of items) {
                let result;
                try {
                    result = await mutateAsync({
                        queryParams: {
                            year,
                            month,
                            district,
                            siteIds: siteIds.join(','),
                        },
                        body: { irsData },
                    });
                } catch {
                    for (const siteId of siteIds) {
                        newResults.set(`${monthKey}:${siteId}`, 'failed');
                    }
                    completed += siteIds.length;
                    setExportProgress({ completed, total });
                    setExportResults(new Map(newResults));
                    continue;
                }

                if (result.ok) {
                    const siteStatuses = deriveSiteStatuses(
                        result.data.results,
                        siteIds,
                    );
                    for (const [siteId, status] of siteStatuses) {
                        newResults.set(`${monthKey}:${siteId}`, status);
                    }
                } else {
                    for (const siteId of siteIds) {
                        newResults.set(`${monthKey}:${siteId}`, 'failed');
                    }
                }

                completed += siteIds.length;
                setExportProgress({ completed, total });
                setExportResults(new Map(newResults));
            }
        } finally {
            setExportStatus('done');
            await queryClient.invalidateQueries({ queryKey: sessionKeys.root });
        }
    }

    function reset() {
        setExportProgress(null);
        setExportResults(new Map());
        setExportStatus('idle');
    }

    return { runExport, reset, exportStatus, exportProgress, exportResults };
}
