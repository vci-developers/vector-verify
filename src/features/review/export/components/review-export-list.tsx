'use client';

import type { Site } from '@/api/site/validation/site-schema';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { format, eachMonthOfInterval, endOfMonth } from 'date-fns';
import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { usePostDhis2Export } from '@/api/dhis2/hooks/use-post-dhis2-export';
import { sessionKeys } from '@/api/session/session-keys';
import type { Dhis2ExportSiteStatus } from '@/api/dhis2/validation/dhis2-sync-schema';
import ExportMonthRow from '@/features/review/export/components/export-month-row';
import ExportProgressPanel from '@/features/review/export/components/export-progress-panel';
import ExportConfirmDialog from '@/features/review/export/components/export-confirm-dialog';
import type { SiteIrsData } from '@/api/dhis2/validation/post-dhis2-uganda-schema';

type ExportStatus = 'idle' | 'exporting' | 'done';

interface ReviewExportListProps {
    sites: Site[];
    locationQueryParam: LocationQueryParam;
    startMonth: Date;
    endMonth: Date;
}

export default function ReviewExportList({
    sites,
    locationQueryParam,
    startMonth,
    endMonth,
}: ReviewExportListProps) {
    const district =
        'district' in locationQueryParam ? locationQueryParam.district : null;

    const { mutateAsync: submitDhis2Export } = usePostDhis2Export();
    const queryClient = useQueryClient();

    const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
    const [exportProgress, setExportProgress] = useState<{
        completed: number;
        total: number;
    } | null>(null);
    const [exportResults, setExportResults] = useState<
        Map<string, Map<number, Dhis2ExportSiteStatus>>
    >(new Map());

    const [selectedSites, setSelectedSites] = useState<
        Map<string, Set<number>>
    >(new Map());

    const [showWarningModal, setShowWarningModal] = useState(false);

    const startDate = format(startMonth, 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const { data: getAllSessionsResult, isPending } = useGetAllSessions({
        ...locationQueryParam,
        startDate,
        endDate,
        type: 'SURVEILLANCE',
    });

    const months = eachMonthOfInterval({ start: startMonth, end: endMonth });

    const certifiedCountsByMonth = useMemo(() => {
        const map = new Map<string, Map<number, number>>();
        if (!getAllSessionsResult?.ok) return map;

        for (const session of getAllSessionsResult.data.sessions) {
            if (session.state !== 'CERTIFIED') continue;
            const monthKey = format(
                new Date(session.collectionDate),
                'yyyy-MM',
            );
            const certifiedCountsForMonth =
                map.get(monthKey) ?? new Map<number, number>();
            certifiedCountsForMonth.set(
                session.siteId,
                (certifiedCountsForMonth.get(session.siteId) ?? 0) + 1,
            );
            map.set(monthKey, certifiedCountsForMonth);
        }
        return map;
    }, [getAllSessionsResult]);

    const totalCertifiedCount = useMemo(() => {
        let total = 0;
        for (const counts of certifiedCountsByMonth.values()) {
            total += counts.size;
        }
        return total;
    }, [certifiedCountsByMonth]);

    let selectedCount = 0;
    for (const monthSelectedSiteIds of selectedSites.values()) {
        selectedCount += monthSelectedSiteIds.size;
    }
    const allSelected =
        totalCertifiedCount > 0 && selectedCount === totalCertifiedCount;

    async function runExport(irsDataBySiteId: Map<number, SiteIrsData>) {
        if (!district) return;
        setExportStatus('exporting');
        setExportResults(new Map());

        let totalToExport = 0;
        for (const siteIds of selectedSites.values()) {
            totalToExport += siteIds.size;
        }
        setExportProgress({ completed: 0, total: totalToExport });

        const newResults = new Map<
            string,
            Map<number, Dhis2ExportSiteStatus>
        >();
        let completedCount = 0;

        try {
            for (const monthKey of [...selectedSites.keys()].sort()) {
                const [yearString, monthString] = monthKey.split('-');
                const year = Number(yearString);
                const month = Number(monthString);

                const monthResults = new Map<number, Dhis2ExportSiteStatus>();
                newResults.set(monthKey, monthResults);

                for (const siteId of selectedSites.get(monthKey)!) {
                    const irsData = irsDataBySiteId.get(siteId) ?? {
                        siteId,
                        wasIrsSprayed: false,
                    };

                    let siteExportStatus: Dhis2ExportSiteStatus;
                    try {
                        const postDhis2ExportResult = await submitDhis2Export({
                            queryParams: {
                                year,
                                month,
                                district,
                                siteIds: [siteId],
                            },
                            body: { irsData: [irsData] },
                        });
                        if (postDhis2ExportResult.ok) {
                            const resultsForSite =
                                postDhis2ExportResult.data.results.filter(
                                    syncResult => syncResult.siteId === siteId,
                                );
                            siteExportStatus = resultsForSite.some(
                                syncResult => syncResult.status === 'failed',
                            )
                                ? 'failed'
                                : resultsForSite.some(
                                        syncResult =>
                                            syncResult.status === 'success',
                                    )
                                  ? 'success'
                                  : 'skipped';
                        } else {
                            siteExportStatus = 'failed';
                        }
                    } catch {
                        siteExportStatus = 'failed';
                    }
                    monthResults.set(siteId, siteExportStatus);

                    completedCount += 1;
                    setExportProgress({
                        completed: completedCount,
                        total: totalToExport,
                    });
                    setExportResults(new Map(newResults));
                }
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

    function handleToggleSites(
        monthKey: string,
        siteIds: number[],
        select: boolean,
    ) {
        setSelectedSites(previousSelectedSites => {
            const nextSelectedSites = new Map(previousSelectedSites);
            const monthSiteIds = new Set(nextSelectedSites.get(monthKey) ?? []);
            for (const siteId of siteIds) {
                if (select) monthSiteIds.add(siteId);
                else monthSiteIds.delete(siteId);
            }
            nextSelectedSites.set(monthKey, monthSiteIds);
            return nextSelectedSites;
        });
    }

    function handleSelectAll() {
        const nextSelectedSites = new Map<string, Set<number>>();
        for (const [monthKey, counts] of certifiedCountsByMonth) {
            nextSelectedSites.set(monthKey, new Set(counts.keys()));
        }
        setSelectedSites(nextSelectedSites);
    }

    function handleDeselectAll() {
        setSelectedSites(new Map());
    }

    async function handleConfirmExport(
        siteIrsDataBySiteId: Map<number, SiteIrsData>,
    ) {
        setShowWarningModal(false);
        await runExport(siteIrsDataBySiteId);
    }

    function handleDone() {
        handleDeselectAll();
        reset();
    }

    const skeletonCount = new Set(sites.map(site => site.subCounty)).size || 5;

    if (isPending || !getAllSessionsResult) {
        return (
            <div className="space-y-2">
                {months.map(month => (
                    <div key={format(month, 'yyyy-MM')}>
                        <div className="flex items-center gap-2 py-3">
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <SkeletonList
                            count={skeletonCount}
                            height="xl"
                            width="full"
                        />
                    </div>
                ))}
            </div>
        );
    }

    if (!getAllSessionsResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getAllSessionsResult.error.message}
            </p>
        );
    }

    if (totalCertifiedCount === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                    No certified sessions found in the selected date range and
                    location.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                    {selectedCount} of {totalCertifiedCount} certified sites
                    selected
                </span>
                <div className="flex items-center gap-2">
                    {allSelected ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeselectAll}
                            disabled={exportStatus === 'exporting'}
                        >
                            Deselect all
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={exportStatus === 'exporting'}
                        >
                            Select all
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={() => setShowWarningModal(true)}
                        disabled={
                            exportStatus === 'exporting' ||
                            selectedCount === 0 ||
                            !district
                        }
                    >
                        Export to DHIS2
                    </Button>
                </div>
            </div>

            {exportProgress && (
                <ExportProgressPanel
                    completed={exportProgress.completed}
                    total={exportProgress.total}
                    isExportDone={exportStatus === 'done'}
                    onDone={handleDone}
                />
            )}

            <ExportConfirmDialog
                isOpen={showWarningModal}
                onOpenChange={setShowWarningModal}
                selectedSites={selectedSites}
                sites={sites}
                selectedCount={selectedCount}
                onConfirm={handleConfirmExport}
            />

            <div className="space-y-2">
                {months.map(month => {
                    const monthKey = format(month, 'yyyy-MM');
                    return (
                        <ExportMonthRow
                            key={monthKey}
                            month={month}
                            certifiedCountsBySiteId={
                                certifiedCountsByMonth.get(monthKey) ??
                                new Map()
                            }
                            monthSelectedSiteIds={
                                selectedSites.get(monthKey) ?? new Set()
                            }
                            onToggleSites={(siteIds, select) =>
                                handleToggleSites(monthKey, siteIds, select)
                            }
                            exportStatusBySiteId={
                                exportResults.get(monthKey) ?? new Map()
                            }
                            sites={sites}
                            isExporting={exportStatus === 'exporting'}
                        />
                    );
                })}
            </div>
        </div>
    );
}
