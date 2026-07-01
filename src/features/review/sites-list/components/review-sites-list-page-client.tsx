'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import { useGetPrograms } from '@/api/program/hooks/use-get-programs';
import { useGetCollectionCycles } from '@/api/collection-cycle/hooks/use-get-collection-cycles';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useLocationSelection } from '@/lib/location/use-location-selection';
import { StorageKeys } from '@/lib/storage-keys';
import ReviewSitesListHeader from '@/features/review/sites-list/components/layout/review-sites-list-header';
import ReviewSitesList from '@/features/review/sites-list/components/sites/review-sites-list';
import ReviewDhis2Dashboard from '../../dhis2-sync/components/review-dhis2-dashboard';

const REVIEW_TABS = [
    { value: 'sites-list', label: 'SITES LIST' },
    { value: 'submissions', label: 'SUBMISSIONS' },
] as const;

export type ReviewTab = (typeof REVIEW_TABS)[number]['value'];

export default function ReviewSitesListPageClient() {
    const [activeTab, setActiveTab] = useLocalStorage<ReviewTab>(
        StorageKeys.review.activeTab,
        'sites-list',
    );
    const [startMonth, setStartMonth] = useLocalStorage(
        StorageKeys.review.startMonth,
        startOfMonth(subMonths(new Date(), 2)),
    );
    const [endMonth, setEndMonth] = useLocalStorage(
        StorageKeys.review.endMonth,
        startOfMonth(new Date()),
    );
    const [selectedCycleIds, setSelectedCycleIds] = useState<number[]>([]);

    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    const programId = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.programId
        : undefined;

    const { data: getProgramsResult } = useGetPrograms(
        { programId },
        { enabled: programId !== undefined },
    );

    const isUgandaProgram =
        getProgramsResult?.ok === true &&
        getProgramsResult.data.programs[0]?.country === 'Uganda';

    const visibleTabs = REVIEW_TABS.filter(
        tab => tab.value !== 'submissions' || isUgandaProgram,
    );

    const accessibleSites = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites
        : [];

    const {
        selectedLocation,
        setSelectedLocation,
        locationTypeName,
        locationDropdownOptions,
        locationQueryParam,
        descendantsOfSelectedLocation,
    } = useLocationSelection(
        accessibleSites,
        StorageKeys.review.selectedLocation,
    );

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

    function resetCycleFilter() {
        setSelectedCycleIds([]);
    }

    function handleLocationChange(location: string) {
        setSelectedLocation(location);
        resetCycleFilter();
    }

    function handleStartMonthChange(month: Date) {
        setStartMonth(month);
        resetCycleFilter();
    }

    function handleEndMonthChange(month: Date) {
        setEndMonth(month);
        resetCycleFilter();
    }

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return (
            <PageShell
                title="Review"
                description="Review submitted session data by location"
                icon={ClipboardList}
            >
                <p className="text-muted-foreground text-sm">Loading...</p>
            </PageShell>
        );
    }

    if (!getUserPermissionsResult.ok) {
        return (
            <PageShell
                title="Review"
                description="Review submitted session data by location"
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
            title="Review"
            description="Review submitted session data by location"
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <ReviewSitesListHeader
                        tabs={visibleTabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        locationTypeName={locationTypeName}
                        locationDropdownOptions={locationDropdownOptions}
                        selectedLocation={selectedLocation}
                        onLocationChange={handleLocationChange}
                        collectionCycles={collectionCycles}
                        selectedCycleIds={selectedCycleIds}
                        onSelectedCycleIdsChange={setSelectedCycleIds}
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
                        <div className="relative">
                            <SkeletonList count={5} height="xl" width="full" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <ClipboardList className="text-muted-foreground/50 mb-4 h-12 w-12" />
                                <p className="text-muted-foreground text-sm">
                                    Select a location to view data.
                                </p>
                            </div>
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
