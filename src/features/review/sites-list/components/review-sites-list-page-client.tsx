'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfMonth, subMonths, endOfMonth } from 'date-fns';
import { ClipboardList } from 'lucide-react';
import { Fragment, useState } from 'react';
import ReviewSitesListHeader from '@/features/review/sites-list/components/layout/review-sites-list-header';
import { Separator } from '@/components/ui/separator';
import { SkeletonList } from '@/components/ui/skeleton-list';
import ReviewSitesList from '@/features/review/sites-list/components/sites/review-sites-list';
import { useLocationSelection } from '@/lib/location/use-location-selection';
import { useGetCollectionCycles } from '@/api/collection-cycle/hooks/use-get-collection-cycles';

const REVIEW_TABS = [{ value: 'sites-list', label: 'SITES LIST' }] as const;

export type ReviewTab = (typeof REVIEW_TABS)[number]['value'];

export default function ReviewSitesListPageClient() {
    const [activeTab, setActiveTab] = useState<ReviewTab>('sites-list');
    const [startMonth, setStartMonth] = useState(() =>
        startOfMonth(subMonths(new Date(), 2)),
    );
    const [endMonth, setEndMonth] = useState(() => startOfMonth(new Date()));
    const [selectedCycleIds, setSelectedCycleIds] = useState<number[]>([]);

    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

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
    } = useLocationSelection(accessibleSites);

    const programId = descendantsOfSelectedLocation[0]?.programId;
    const startDate = format(startMonth, 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const { data: getCollectionCyclesResult } = useGetCollectionCycles(
        { programId: programId ?? 0, startDate, endDate },
        { enabled: programId !== undefined },
    );

    const collectionCycles = getCollectionCyclesResult?.ok
        ? getCollectionCyclesResult.data.collectionCycles
        : [];

    function handleLocationChange(location: string) {
        setSelectedLocation(location);
        setSelectedCycleIds([]);
    }

    function handleStartMonthChange(month: Date) {
        setStartMonth(month);
        setSelectedCycleIds([]);
    }

    function handleEndMonthChange(month: Date) {
        setEndMonth(month);
        setSelectedCycleIds([]);
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
                        tabs={REVIEW_TABS}
                        activeTab={activeTab}
                        onTabChange={tab => setActiveTab(tab)}
                        locationTypeName={locationTypeName}
                        locationDropdownOptions={locationDropdownOptions}
                        selectedLocation={selectedLocation}
                        onLocationChange={handleLocationChange}
                        startMonth={startMonth}
                        endMonth={endMonth}
                        onStartMonthChange={handleStartMonthChange}
                        onEndMonthChange={handleEndMonthChange}
                        collectionCycles={collectionCycles}
                        selectedCycleIds={selectedCycleIds}
                        onCycleIdsChange={setSelectedCycleIds}
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
                    ) : (
                        <Fragment>
                            {activeTab === 'sites-list' && (
                                <ReviewSitesList
                                    sites={descendantsOfSelectedLocation}
                                    locationQueryParam={locationQueryParam}
                                    startMonth={startMonth}
                                    endMonth={endMonth}
                                    collectionCycles={collectionCycles}
                                    selectedCycleIds={selectedCycleIds}
                                />
                            )}
                        </Fragment>
                    )}
                </CardContent>
            </Card>
        </PageShell>
    );
}
