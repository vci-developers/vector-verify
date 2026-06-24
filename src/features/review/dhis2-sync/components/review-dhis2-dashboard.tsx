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
import { useTranslations } from 'next-intl';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { buildCollectionCycleSegments } from '../../sites-list/utils/build-collection-cycle-segments';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { formatCollectionCycleLabel } from '../../sites-list/utils/format-collection-cycle-label';
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
    const t = useTranslations('CollectionCycle');
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

    const allCycleSegments = useMemo(() => {
        if (!getAllSessionsResult?.ok) return [];
        return buildCollectionCycleSegments(
            getAllSessionsResult.data.sessions,
            collectionCycles,
        );
    }, [getAllSessionsResult, collectionCycles]);

    const sitesWithUnassignedSessions = useMemo(() => {
        const unassignedSegment = allCycleSegments.find(
            segment => segment.cycle === null,
        );
        return new Set(unassignedSegment?.sessionSummaryBySiteId.keys() ?? []);
    }, [allCycleSegments]);

    const cycleSubmissionGroups = useMemo(
        () =>
            allCycleSegments
                .filter(
                    segment =>
                        segment.cycle !== null &&
                        (selectedCycleIds.length === 0 ||
                            selectedCycleIds.includes(segment.cycle.id)),
                )
                .map(segment => {
                    const cycle = segment.cycle!;
                    const sessionSummaryBySiteId =
                        segment.sessionSummaryBySiteId;
                    const submittableSites = sites.filter(site => {
                        const siteSessionSummary = sessionSummaryBySiteId.get(
                            site.siteId,
                        );
                        return (
                            siteSessionSummary !== undefined &&
                            isSiteFullyReviewed(siteSessionSummary)
                        );
                    });
                    const submittedCount = submittableSites.filter(site =>
                        isSiteFullySubmittedToDhis2(
                            sessionSummaryBySiteId.get(site.siteId)!,
                        ),
                    ).length;
                    return {
                        cycle,
                        sessionSummaryBySiteId,
                        submittableSites,
                        submittedCount,
                    };
                }),
        [allCycleSegments, selectedCycleIds, sites],
    );

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
                        DHIS2 Submissions
                    </h2>
                    <p className="text-muted-foreground text-xs">
                        Submit certified site data to DHIS2 per collection
                        cycle.
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
                <p className="text-destructive text-sm">
                    {getAllSessionsResult.error.message}
                </p>
            ) : sites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        No sites found for this location.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {cycleSubmissionGroups.map(group => (
                        <Dhis2CycleSegment
                            key={group.cycle.id}
                            label={formatCollectionCycleLabel(group.cycle, t)}
                            submittedCount={group.submittedCount}
                            siteCount={group.submittableSites.length}
                        >
                            {group.submittableSites.map(site => {
                                return (
                                    <Dhis2SiteRow
                                        key={site.siteId}
                                        site={site}
                                        collectionCycle={group.cycle}
                                        siteSessionSummary={
                                            group.sessionSummaryBySiteId.get(
                                                site.siteId,
                                            )!
                                        }
                                        siteHasUnassignedSessions={sitesWithUnassignedSessions.has(
                                            site.siteId,
                                        )}
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
