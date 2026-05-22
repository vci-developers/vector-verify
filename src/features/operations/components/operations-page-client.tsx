'use client';

import { Fragment, useEffect, useState } from 'react';
import { useLocalStorage } from '@/lib/storage/hooks/use-local-storage';
import { StorageKeys } from '@/lib/storage/storage-keys';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Microscope } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import OperationsHeader from '@/features/operations/components/layout/operations-header';
import OperationsAiPerformance from '@/features/operations/ai-performance/components/operations-ai-performance';
import OperationsGeographicalSummary from '@/features/operations/geographical-summary/components/operations-geographical-summary';
import { SkeletonList } from '@/components/ui/skeleton-list';
import ExportDialog from '@/features/operations/components/export/export-dialog';
import OperationsSpecimenComposition from '@/features/operations/specimen-composition/components/operations-specimen-composition';
import OperationsFieldUserCompliance from '@/features/operations/field-user-compliance/components/operations-field-user-compliance';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import { useLocationSelection } from '@/lib/location/use-location-selection';

const OPERATIONS_TABS = [
    {
        value: 'geographical-summary',
        label: 'GEOGRAPHICAL SUMMARY',
        shouldRender: () => true,
    },
    {
        value: 'specimen-composition',
        label: 'SPECIMEN COMPOSITION',
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
        label: 'FIELD TEAM PERFORMANCE',
        shouldRender: () => true,
    },
] as const;

export type OperationsTab = (typeof OPERATIONS_TABS)[number]['value'];

export default function OperationsPageClient() {
    const [activeTab, setActiveTab] = useLocalStorage<OperationsTab>(
        StorageKeys.operations.activeTab,
        'geographical-summary',
    );
    const [startMonth, setStartMonth] = useLocalStorage(
        StorageKeys.operations.startMonth,
        startOfMonth(subMonths(new Date(), 2)),
    );
    const [endMonth, setEndMonth] = useLocalStorage(
        StorageKeys.operations.endMonth,
        startOfMonth(new Date()),
    );
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
        null,
    );

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
    } = useLocationSelection(
        accessibleSites,
        StorageKeys.operations.selectedLocation,
    );

    useEffect(() => {
        setSelectedMarkerId(null);
    }, [selectedLocation, startMonth, endMonth]);

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
                            {activeTab === 'specimen-composition' && (
                                <OperationsSpecimenComposition
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
                                    selectedMarkerId={selectedMarkerId}
                                    onMarkerSelect={setSelectedMarkerId}
                                />
                            )}

                            {activeTab === 'ai-performance' && (
                                <OperationsAiPerformance
                                    locationQueryParam={locationQueryParam}
                                    selectedLocationName={selectedLocation}
                                    startDate={startDate}
                                    endDate={endDate}
                                />
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
