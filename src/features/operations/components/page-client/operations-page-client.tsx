'use client';

import { Fragment, useState } from 'react';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Microscope } from 'lucide-react';
import OperationsSiteList from '@/features/operations/components/site-list/operations-site-list';
import { Separator } from '@/components/ui/separator';
import OperationsHeader from '@/features/operations/components/layout/operations-header';
import OperationsAiPerformanceTab from '@/features/operations/components/ai-performance/operations-ai-performance-tab';
import OperationsGeographicalSummary from '@/features/operations/components/geographical-summary/operations-geographical-summary';
import { SkeletonList } from '@/components/ui/skeleton-list';
import ExportDialog from '@/features/operations/components/export/export-dialog';
import OperationsSpeciesComposition from '../species-composition/operations-species-composition';
import OperationsFieldUserCompliance from '@/features/operations/components/field-user-compliance/operations-field-user-compliance';
import { useLocationSelection } from '../../hooks/use-location-selection';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';

const OPERATIONS_TABS = [
    { value: 'sites', label: 'SITES', shouldRender: () => true },
    {
        value: 'geographical-summary',
        label: 'GEOGRAPHICAL SUMMARY',
        shouldRender: () => true,
    },
    {
        value: 'species-composition',
        label: 'SPECIES COMPOSITION',
        shouldRender: () => true,
    },
    {
        value: 'ai-performance',
        label: 'AI PERFORMANCE',
        shouldRender: (permissions: UserPermissions) =>
            permissions.annotations.viewAndWriteAnnotationTasks,
    },
    {
        value: 'field-user-compliance',
        label: 'FIELD USER COMPLIANCE',
        shouldRender: () => true,
    },
] as const;

export type OperationsTab = (typeof OPERATIONS_TABS)[number]['value'];

export default function OperationsPageClient() {
    const [activeTab, setActiveTab] = useState<OperationsTab>('sites');
    const [startMonth, setStartMonth] = useState(() =>
        startOfMonth(subMonths(new Date(), 2)),
    );
    const [endMonth, setEndMonth] = useState(() => startOfMonth(new Date()));
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

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

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return (
            <PageShell
                title="Operations"
                description="Monitor field operations by location"
                icon={Microscope}
            >
                <p className="text-muted-foreground text-sm">Loading...</p>
            </PageShell>
        );
    }

    if (!getUserPermissionsResult.ok) {
        return (
            <PageShell
                title="Operations"
                description="Monitor field operations by location"
                icon={Microscope}
            >
                <p className="text-destructive text-sm">
                    {getUserPermissionsResult.error.message}
                </p>
            </PageShell>
        );
    }

    const startDate = format(startMonth, 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const visibleTabs = OPERATIONS_TABS.filter(tab =>
        tab.shouldRender(getUserPermissionsResult.data.permissions),
    );

    return (
        <PageShell
            title="Operations"
            description="Monitor field operations by location"
            icon={Microscope}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <OperationsHeader
                        tabs={visibleTabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        locationTypeName={locationTypeName}
                        locationDropdownOptions={locationDropdownOptions}
                        selectedLocation={selectedLocation}
                        onLocationChange={setSelectedLocation}
                        startMonth={startMonth}
                        endMonth={endMonth}
                        onStartMonthChange={setStartMonth}
                        onEndMonthChange={setEndMonth}
                        onExportClick={() => setIsExportDialogOpen(true)}
                    />

                    <Separator />

                    {!locationQueryParam ? (
                        <div className="relative">
                            <SkeletonList count={5} height="xl" width="full" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <Microscope className="text-muted-foreground/50 mb-4 h-12 w-12" />
                                <p className="text-muted-foreground text-sm">
                                    Select a location to view data.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Fragment>
                            {activeTab === 'sites' && (
                                <OperationsSiteList
                                    sites={descendantsOfSelectedLocation}
                                    locationQueryParam={locationQueryParam}
                                    startMonth={startMonth}
                                    endMonth={endMonth}
                                />
                            )}

                            {activeTab === 'species-composition' && (
                                <OperationsSpeciesComposition
                                    locationQueryParam={locationQueryParam}
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            )}

                            {activeTab === 'geographical-summary' && (
                                <OperationsGeographicalSummary
                                    locationQueryParam={locationQueryParam}
                                    selectedLocation={selectedLocation}
                                    descendantsOfSelectedLocation={
                                        descendantsOfSelectedLocation
                                    }
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            )}

                            {activeTab === 'ai-performance' && (
                                <OperationsAiPerformanceTab />
                            )}

                            {activeTab === 'field-user-compliance' && (
                                <OperationsFieldUserCompliance
                                    locationQueryParam={locationQueryParam}
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            )}
                        </Fragment>
                    )}
                </CardContent>
            </Card>

            <ExportDialog
                open={isExportDialogOpen}
                onOpenChange={setIsExportDialogOpen}
                programId={getUserPermissionsResult.data.programId}
                locationQueryParam={locationQueryParam!}
                locationName={selectedLocation}
                startDate={startDate}
                endDate={endDate}
            />
        </PageShell>
    );
}
