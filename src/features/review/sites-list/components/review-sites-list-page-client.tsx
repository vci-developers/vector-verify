'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import { useGetPrograms } from '@/api/program/hooks/use-get-programs';
import { useGetCollectionCycles } from '@/api/collection-cycle/hooks/use-get-collection-cycles';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { useLocationSelection } from '@/lib/location/use-location-selection';
import {
    useReviewFilters,
    type ReviewTab,
} from '@/features/review/view-state/use-review-filters';
import ReviewSitesListHeader from '@/features/review/sites-list/components/layout/review-sites-list-header';
import ReviewSitesList from '@/features/review/sites-list/components/sites/review-sites-list';
import ReviewDhis2Dashboard from '../../dhis2-sync/components/review-dhis2-dashboard';
import type { SessionState } from '@/api/session/validation/session-schema';
import { useTranslations } from 'next-intl';

const REVIEW_TABS: { value: ReviewTab; label: string }[] = [
    { value: 'sites-list', label: 'SITES LIST' },
    { value: 'submissions', label: 'SUBMISSIONS' },
];

const DEFAULT_REVIEW_STATE_FILTER: SessionState[] = ['NEEDS_REVIEW'];

export default function ReviewSitesListPageClient() {
    const t = useTranslations('Review');
    const tCommon = useTranslations('Common');
    const [filters, setFilters] = useReviewFilters();
    const { activeTab, startMonth, endMonth, selectedLocation } = filters;
    const [selectedCycleIds, setSelectedCycleIds] = useState<number[]>([]);
    const [selectedReviewStates, setSelectedReviewStates] = useState<
        SessionState[]
    >(DEFAULT_REVIEW_STATE_FILTER);

    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    const programId = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.programId
        : undefined;

    const { data: getUgandaProgramsResult } = useGetPrograms({
        country: 'Uganda',
    });

    const isUgandaProgram =
        getUgandaProgramsResult?.ok === true &&
        getUgandaProgramsResult.data.programs.some(
            program => program.programId === programId,
        );

    const visibleTabs = REVIEW_TABS.filter(
        tab => tab.value !== 'submissions' || isUgandaProgram,
    );

    const accessibleSites = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites
        : [];

    const {
        locationTypeName,
        locationDropdownOptions,
        locationQueryParam,
        descendantsOfSelectedLocation,
    } = useLocationSelection(accessibleSites, selectedLocation);

    const startDate = format(startOfMonth(startMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const {
        data: getCollectionCyclesResult,
        isPending: isGetCollectionCyclesPending,
    } = useGetCollectionCycles(
        programId ?? 0,
        { startDate, endDate },
        { enabled: programId !== undefined },
    );

    const collectionCycles = getCollectionCyclesResult?.ok
        ? getCollectionCyclesResult.data.collectionCycles
        : [];

    function resetFilters() {
        setSelectedCycleIds([]);
        setSelectedReviewStates(DEFAULT_REVIEW_STATE_FILTER);
    }

    function handleTabChange(tab: ReviewTab) {
        setFilters({ activeTab: tab });
    }

    function handleLocationChange(location: string) {
        setFilters({ selectedLocation: location });
        resetFilters();
    }

    function handleStartMonthChange(month: Date) {
        setFilters({ startMonth: month });
        resetFilters();
    }

    function handleEndMonthChange(month: Date) {
        setFilters({ endMonth: month });
        resetFilters();
    }

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return (
            <PageShell
                title={t('review')}
                description={t('reviewDescription')}
                icon={ClipboardList}
            >
                <p className="text-muted-foreground text-sm">
                    {tCommon('loading')}
                </p>
            </PageShell>
        );
    }

    if (!getUserPermissionsResult.ok) {
        return (
            <PageShell
                title={t('review')}
                description={t('reviewDescription')}
                icon={ClipboardList}
            >
                <p className="text-destructive text-sm">
                    {getUserPermissionsResult.error.message}
                </p>
            </PageShell>
        );
    }

    return (
        <PageShell
            title={t('review')}
            description={t('reviewDescription')}
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <ReviewSitesListHeader
                        tabs={visibleTabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        locationTypeName={locationTypeName}
                        locationDropdownOptions={locationDropdownOptions}
                        selectedLocation={selectedLocation}
                        onLocationChange={handleLocationChange}
                        collectionCycles={collectionCycles}
                        selectedCycleIds={selectedCycleIds}
                        onSelectedCycleIdsChange={setSelectedCycleIds}
                        selectedReviewStates={selectedReviewStates}
                        onSelectedReviewStatesChange={setSelectedReviewStates}
                        disabled={
                            isGetCollectionCyclesPending ||
                            collectionCycles.length === 0
                        }
                        startMonth={startMonth}
                        endMonth={endMonth}
                        onStartMonthChange={handleStartMonthChange}
                        onEndMonthChange={handleEndMonthChange}
                        maxDate={new Date()}
                    />

                    <Separator />

                    {!locationQueryParam ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                            <ClipboardList className="text-muted-foreground/50 mb-4 h-12 w-12" />
                            <p className="text-muted-foreground text-sm">
                                {t('selectALocation')}
                            </p>
                        </div>
                    ) : activeTab === 'sites-list' ? (
                        isGetCollectionCyclesPending ? (
                            <SkeletonList count={5} height="xl" width="full" />
                        ) : (
                            <ReviewSitesList
                                sites={descendantsOfSelectedLocation}
                                locationQueryParam={locationQueryParam}
                                startMonth={startMonth}
                                endMonth={endMonth}
                                collectionCycles={collectionCycles}
                                selectedCycleIds={selectedCycleIds}
                                selectedReviewStates={selectedReviewStates}
                            />
                        )
                    ) : (
                        <ReviewDhis2Dashboard
                            sites={descendantsOfSelectedLocation}
                            locationQueryParam={locationQueryParam}
                            startMonth={startMonth}
                            endMonth={endMonth}
                            collectionCycles={collectionCycles}
                            selectedCycleIds={selectedCycleIds}
                        />
                    )}
                </CardContent>
            </Card>
        </PageShell>
    );
}
