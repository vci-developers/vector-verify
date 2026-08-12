'use client';

import { Fragment, useEffect, useState } from 'react';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import { useIsUgandaProgram } from '@/api/program/hooks/use-is-uganda-program';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { endOfMonth, format } from 'date-fns';
import { Microscope } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import OperationsHeader from '@/features/operations/components/layout/operations-header';
import OperationsAiPerformance from '@/features/operations/ai-performance/components/operations-ai-performance';
import OperationsGeographicalSummary from '@/features/operations/geographical-summary/components/operations-geographical-summary';
import ExportDialog from '@/features/operations/components/export/export-dialog';
import OperationsSpecimenComposition from '@/features/operations/specimen-composition/components/operations-specimen-composition';
import OperationsFieldUserCompliance from '@/features/operations/field-user-compliance/components/operations-field-user-compliance';
import OperationsInterventionMetrics from '@/features/operations/intervention-metrics/components/operations-intervention-metrics';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import { useLocationMultiSelection } from '@/lib/location/use-location-multiselection';
import {
    useOperationsFilters,
    type OperationsTab,
} from '@/features/operations/view-state/use-operations-filters';
import { useTranslations } from 'next-intl';
import EmptyBanner from '@/components/ui/empty-banner';

const OPERATIONS_TABS: {
    value: OperationsTab;
    label: string;
    shouldRender: (
        permissions: UserPermissions,
        isUgandaProgram: boolean,
    ) => boolean;
}[] = [
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
        shouldRender: permissions =>
            permissions.annotations.viewAndWriteAnnotationTasks,
    },
    {
        value: 'intervention-metrics',
        label: 'INTERVENTION METRICS',
        shouldRender: (_permissions, isUgandaProgram) => isUgandaProgram,
    },
    {
        value: 'field-user-compliance',
        label: 'FIELD TEAM PERFORMANCE',
        shouldRender: () => true,
    },
];

export default function OperationsPageClient() {
    const t = useTranslations('Operations');
    const tCommon = useTranslations('Common');
    const [filters, setFilters] = useOperationsFilters();
    const { activeTab, startMonth, endMonth, selectedLocations } = filters;
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    const programId = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.programId
        : undefined;

    const isUgandaProgram = useIsUgandaProgram(programId);

    const accessibleSites = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites
        : [];

    const {
        locationTypeName,
        locationDropdownOptions,
        selectedSiteIdsParam,
        descendantsOfSelectedLocations,
        siteIdToLocationLabel,
    } = useLocationMultiSelection(accessibleSites, selectedLocations);

    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
        null,
    );

    useEffect(() => {
        setSelectedMarkerId(null);
    }, [selectedLocations, startMonth, endMonth, setSelectedMarkerId]);

    function handleTabChange(tab: OperationsTab) {
        setFilters({ activeTab: tab });
    }

    function handleLocationsChange(locations: string[]) {
        setFilters({ selectedLocations: locations });
    }

    function handleStartMonthChange(month: Date) {
        setFilters({ startMonth: month });
    }

    function handleEndMonthChange(month: Date) {
        setFilters({ endMonth: month });
    }

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return (
            <PageShell
                title={t('operations')}
                description={t('operationsDescription')}
                icon={Microscope}
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
                title={t('operations')}
                description={t('operationsDescription')}
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
        tab.shouldRender(
            getUserPermissionsResult.data.permissions,
            isUgandaProgram,
        ),
    );

    return (
        <PageShell
            title={t('operations')}
            description={t('operationsDescription')}
            icon={Microscope}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <OperationsHeader
                        tabs={visibleTabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        locationTypeName={locationTypeName}
                        locationDropdownOptions={locationDropdownOptions}
                        selectedLocations={selectedLocations}
                        onLocationsChange={handleLocationsChange}
                        startMonth={startMonth}
                        endMonth={endMonth}
                        onStartMonthChange={handleStartMonthChange}
                        onEndMonthChange={handleEndMonthChange}
                        onExportClick={() => setIsExportDialogOpen(true)}
                    />

                    <Separator />

                    {!selectedSiteIdsParam ? (
                        <EmptyBanner message={t('selectALocation')}>
                            <Microscope className="text-muted-foreground/50 mb-4 h-12 w-12" />
                        </EmptyBanner>
                    ) : (
                        <Fragment>
                            {activeTab === 'specimen-composition' && (
                                <OperationsSpecimenComposition
                                    siteIds={selectedSiteIdsParam}
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            )}

                            {activeTab === 'geographical-summary' && (
                                <OperationsGeographicalSummary
                                    programId={
                                        getUserPermissionsResult.data.programId
                                    }
                                    siteIds={selectedSiteIdsParam}
                                    descendantsOfSelectedLocations={
                                        descendantsOfSelectedLocations
                                    }
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectedMarkerId={selectedMarkerId}
                                    setSelectedMarkerId={setSelectedMarkerId}
                                />
                            )}

                            {activeTab === 'ai-performance' && (
                                <OperationsAiPerformance
                                    siteIds={selectedSiteIdsParam}
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            )}

                            {activeTab === 'field-user-compliance' && (
                                <OperationsFieldUserCompliance
                                    siteIds={selectedSiteIdsParam}
                                    siteIdToLocationLabel={
                                        siteIdToLocationLabel
                                    }
                                    startDate={startDate}
                                    endDate={endDate}
                                />
                            )}

                            {activeTab === 'intervention-metrics' && (
                                <OperationsInterventionMetrics
                                    sites={descendantsOfSelectedLocations}
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
                siteIds={selectedSiteIdsParam!}
                locationName={[...new Set(siteIdToLocationLabel.values())].join(
                    ', ',
                )}
                startDate={startDate}
                endDate={endDate}
            />
        </PageShell>
    );
}
