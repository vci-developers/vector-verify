'use client';

import { Fragment, useState } from 'react';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Microscope } from 'lucide-react';
import OperationsMetrics from '@/features/operations/components/metrics/operations-metrics';
import OperationsSiteList from '@/features/operations/components/site-list/operations-site-list';
import { Separator } from '@/components/ui/separator';
import OperationsHeader from '@/features/operations/components/layout/operations-header';
import OperationsAiPerformanceTab from '@/features/operations/components/ai-performance/operations-ai-performance-tab';
import {
    getSitesLocationLabel,
    getSiteTopLevelLocation,
} from '@/api/site/utils';
import { SkeletonList } from '@/components/ui/skeleton-list';
import ExportDialog from '@/features/operations/components/export/export-dialog';

const OPERATIONS_TABS = [
    { value: 'sites', label: 'SITES' },
    { value: 'metrics', label: 'METRICS' },
    { value: 'ai-performance', label: 'AI PERFORMANCE' },
] as const;

export type OperationsTab = (typeof OPERATIONS_TABS)[number]['value'];

export default function OperationsPageClient() {
    const [selectedLocation, setSelectedLocation] = useState<string>('');
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

    const accessibleSites =
        getUserPermissionsResult.data.permissions.sites.canAccessSites;

    const filteredAccessibleSites = selectedLocation
        ? accessibleSites.filter(
              site => getSiteTopLevelLocation(site) === selectedLocation,
          )
        : accessibleSites;

    const accessibleLocations = [
        ...new Set(
            accessibleSites
                .map(site => getSiteTopLevelLocation(site))
                .filter((location): location is string => Boolean(location)),
        ),
    ].sort();
    const locationLabel = getSitesLocationLabel(accessibleSites);

    const startDate = format(startMonth, 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    return (
        <PageShell
            title="Operations"
            description="Monitor field operations by location"
            icon={Microscope}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <OperationsHeader
                        tabs={OPERATIONS_TABS}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        locations={accessibleLocations}
                        selectedLocation={selectedLocation}
                        onLocationChange={setSelectedLocation}
                        startMonth={startMonth}
                        endMonth={endMonth}
                        onStartMonthChange={setStartMonth}
                        onEndMonthChange={setEndMonth}
                        onExportClick={() => setIsExportDialogOpen(true)}
                        locationLabel={locationLabel}
                    />

                    <Separator />

                    {!selectedLocation ? (
                        <div className="relative">
                            <SkeletonList count={5} height="xl" width="full" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <Microscope className="text-muted-foreground/50 mb-4 h-12 w-12" />
                                <p className="text-muted-foreground text-sm">
                                    {`Select a ${locationLabel.toLowerCase()} to view data.`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Fragment>
                            {activeTab === 'sites' && (
                                <OperationsSiteList
                                    sites={filteredAccessibleSites}
                                    topLevelLocation={selectedLocation}
                                    startMonth={startMonth}
                                    endMonth={endMonth}
                                />
                            )}

                            {activeTab === 'metrics' && <OperationsMetrics />}

                            {activeTab === 'ai-performance' && (
                                <OperationsAiPerformanceTab />
                            )}
                        </Fragment>
                    )}
                </CardContent>
            </Card>

            <ExportDialog
                open={isExportDialogOpen}
                onOpenChange={setIsExportDialogOpen}
                programId={getUserPermissionsResult.data.programId}
                topLevelLocation={selectedLocation}
                startDate={startDate}
                endDate={endDate}
            />
        </PageShell>
    );
}
