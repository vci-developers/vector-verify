'use client';

import { useMemo, useState } from 'react';
import Dhis2CycleSegment from './dhis2-cycle-segment';
import Dhis2SyncToolbar from './dhis2-sync-toolbar';
import type { Site } from '@/api/site/validation/site-schema';
import {
    buildSiteFilter,
    type LocationQueryParam,
} from '@/lib/location/location-query';
import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { buildReviewSegments } from '../../sites-list/utils/build-review-segments';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { formatCollectionCycleLabel } from '../../utils/format-collection-cycle-label';
import Dhis2SiteRow from './dhis2-site-row';
import {
    isSiteFullyReviewed,
    isSiteFullySubmittedToDhis2,
} from '../../utils/review-site-session-summary';
import { useQueryClient } from '@tanstack/react-query';
import { usePostDhis2SyncTask } from '@/api/dhis2/hooks/use-post-dhis2-sync-task';
import { dhis2SyncKeys } from '@/api/dhis2/dhis2-sync-keys';
import type { SiteIrsData } from '@/api/dhis2/validation/post-dhis2-sync-task-schema';
import Dhis2IrsDialog from './dhis2-irs-dialog';
import ErrorBanner from '@/components/ui/error-banner';
import { useTranslations } from 'next-intl';
import EmptyBanner from '@/components/ui/empty-banner';

interface ReviewDhis2DashboardProps {
    sites: Site[];
    locationQueryParam: LocationQueryParam;
    startMonth: Date;
    endMonth: Date;
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
}

export default function ReviewDhis2Dashboard({
    sites,
    locationQueryParam,
    startMonth,
    endMonth,
    collectionCycles,
    selectedCycleIds,
}: ReviewDhis2DashboardProps) {
    const t = useTranslations('Dhis2Submissions');
    const queryClient = useQueryClient();
    const { mutate: createDhis2SyncTask } = usePostDhis2SyncTask();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSitesIrsDialogOpen, setIsSitesIrsDialogOpen] = useState(false);

    const startDate = format(startOfMonth(startMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            ...buildSiteFilter(locationQueryParam),
            startDate,
            endDate,
            type: 'SURVEILLANCE',
        });

    const [selectedSiteRowKeys, setSelectedSiteRowKeys] = useState<Set<string>>(
        new Set(),
    );

    function siteRowKey(collectionCycleId: number, siteId: number) {
        return `${collectionCycleId}:${siteId}`;
    }

    function toggleSiteRowSelected(collectionCycleId: number, siteId: number) {
        const key = siteRowKey(collectionCycleId, siteId);
        setSelectedSiteRowKeys(previous => {
            const next = new Set(previous);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    const cycleSubmissionGroups = useMemo(() => {
        if (!getAllSessionsResult?.ok) return [];
        return buildReviewSegments({
            sessions: getAllSessionsResult.data.sessions,
            collectionCycles,
            selectedCycleIds,
            startMonth,
            endMonth,
        })
            .filter(segment => segment.kind === 'cycle')
            .map(segment => {
                const cycle = collectionCycles.find(
                    candidate => candidate.id === segment.collectionCycleId,
                )!;
                const summaryBySiteId = segment.summaryBySiteId;
                const submittableSites = sites.filter(site => {
                    const siteSessionSummary = summaryBySiteId.get(site.siteId);
                    return (
                        siteSessionSummary !== undefined &&
                        isSiteFullyReviewed(siteSessionSummary)
                    );
                });
                const submittedCount = submittableSites.filter(site =>
                    isSiteFullySubmittedToDhis2(
                        summaryBySiteId.get(site.siteId)!,
                    ),
                ).length;
                return {
                    cycle,
                    summaryBySiteId,
                    submittableSites,
                    submittedCount,
                };
            });
    }, [
        getAllSessionsResult,
        collectionCycles,
        selectedCycleIds,
        startMonth,
        endMonth,
        sites,
    ]);

    const selectedSubmissions = useMemo<
        { site: Site; collectionCycle: CollectionCycle }[]
    >(() => {
        const submissions: {
            site: Site;
            collectionCycle: CollectionCycle;
        }[] = [];
        for (const group of cycleSubmissionGroups) {
            for (const site of group.submittableSites) {
                if (
                    selectedSiteRowKeys.has(
                        siteRowKey(group.cycle.id, site.siteId),
                    )
                ) {
                    submissions.push({ site, collectionCycle: group.cycle });
                }
            }
        }
        return submissions;
    }, [cycleSubmissionGroups, selectedSiteRowKeys]);

    function handleConfirmBulkSubmit(irsData: SiteIrsData[]) {
        selectedSubmissions.forEach(({ site, collectionCycle }, index) => {
            createDhis2SyncTask({
                queryParams: {
                    collectionCycleId: collectionCycle.id,
                    siteId: site.siteId,
                },
                requestBody: {
                    irsData: [irsData[index] ?? { siteId: site.siteId }],
                },
            });
        });
        setSelectedSiteRowKeys(new Set());
    }

    async function handleRefresh() {
        setIsRefreshing(true);
        try {
            await queryClient.invalidateQueries({
                queryKey: dhis2SyncKeys.root,
            });
        } finally {
            setIsRefreshing(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-foreground text-sm font-semibold tracking-widest uppercase">
                        {t('dhis2Title')}
                    </h2>
                    <p className="text-muted-foreground text-xs">
                        {t('dhis2Description')}
                    </p>
                </div>
                <Dhis2SyncToolbar
                    selectedSiteRowCount={selectedSubmissions.length}
                    isRefreshing={isRefreshing}
                    onSubmitSelected={() => setIsSitesIrsDialogOpen(true)}
                    onRefresh={handleRefresh}
                />
            </div>

            {isGetAllSessionsPending || !getAllSessionsResult ? (
                <SkeletonList count={5} height="xl" width="full" />
            ) : !getAllSessionsResult.ok ? (
                <ErrorBanner
                    message={
                        getAllSessionsResult.error.message || t('sessionsError')
                    }
                />
            ) : sites.length === 0 ? (
                <EmptyBanner message={t('noSites')} />
            ) : (
                <div className="space-y-2">
                    {cycleSubmissionGroups.map(group => (
                        <Dhis2CycleSegment
                            key={group.cycle.id}
                            label={formatCollectionCycleLabel(group.cycle)}
                            submittedCount={group.submittedCount}
                            siteCount={group.submittableSites.length}
                        >
                            {group.submittableSites.map(site => {
                                const certifierName =
                                    getAllSessionsResult.data.sessions.find(
                                        session =>
                                            session.siteId === site.siteId &&
                                            session.collectionCycleId ===
                                                group.cycle.id &&
                                            session.certifiedBy != null,
                                    )?.certifiedBy?.name ?? undefined;
                                return (
                                    <Dhis2SiteRow
                                        key={site.siteId}
                                        site={site}
                                        collectionCycle={group.cycle}
                                        siteSessionSummary={
                                            group.summaryBySiteId.get(
                                                site.siteId,
                                            )!
                                        }
                                        certifierName={certifierName}
                                        isSelected={selectedSiteRowKeys.has(
                                            siteRowKey(
                                                group.cycle.id,
                                                site.siteId,
                                            ),
                                        )}
                                        onToggleSelected={() =>
                                            toggleSiteRowSelected(
                                                group.cycle.id,
                                                site.siteId,
                                            )
                                        }
                                    />
                                );
                            })}
                        </Dhis2CycleSegment>
                    ))}
                </div>
            )}
            <Dhis2IrsDialog
                open={isSitesIrsDialogOpen}
                onOpenChange={setIsSitesIrsDialogOpen}
                submissions={selectedSubmissions}
                onConfirmSubmission={handleConfirmBulkSubmit}
            />
        </div>
    );
}
