'use client';

import { Fragment, useEffect, useState } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { StorageKeys } from '@/lib/storage-keys';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Microscope } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import OperationsHeader from '@/features/operations/components/layout/operations-header';
import OperationsAiPerformance from '@/features/operations/ai-performance/components/operations-ai-performance';
import OperationsGeographicalSummary from '@/features/operations/geographical-summary/components/operations-geographical-summary';
import ExportDialog from '@/features/operations/components/export/export-dialog';
import OperationsSpecimenComposition from '@/features/operations/specimen-composition/components/operations-specimen-composition';
import OperationsFieldUserCompliance from '@/features/operations/field-user-compliance/components/operations-field-user-compliance';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import { useLocationMultiSelection } from '@/lib/location/use-location-multiselection';
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('Operations');
    const tCommon = useTranslations('Common');
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

    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    const accessibleSites = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites
        : [];

    const {
        selectedLocations,
        setSelectedLocations,
        locationTypeName,
        locationDropdownOptions,
        selectedSiteIdsParam,
        descendantsOfSelectedLocations,
        siteIdToLocationLabel,
    } = useLocationMultiSelection(
        accessibleSites,
        StorageKeys.operations.selectedLocations,
    );

    const [selectedMarkerId, setSelectedMarkerId] = useLocalStorage<
        string | null
    >(StorageKeys.operations.selectedMarkerId, null);

    useEffect(() => {
        setSelectedMarkerId(null);
    }, [selectedLocations, startMonth, endMonth, setSelectedMarkerId]);

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
        tab.shouldRender(getUserPermissionsResult.data.permissions),
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
                        onTabChange={setActiveTab}
                        locationTypeName={locationTypeName}
                        locationDropdownOptions={locationDropdownOptions}
                        selectedLocations={selectedLocations}
                        onLocationsChange={setSelectedLocations}
                        startMonth={startMonth}
                        endMonth={endMonth}
                        onStartMonthChange={setStartMonth}
                        onEndMonthChange={setEndMonth}
                        onExportClick={() => setIsExportDialogOpen(true)}
                    />

                    <Separator />

                    {!selectedSiteIdsParam ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                            <Microscope className="text-muted-foreground/50 mb-4 h-12 w-12" />
                            <p className="text-muted-foreground text-sm">
                                {t('selectALocation')}
                            </p>
                        </div>
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
                                    selectedLocations={selectedLocations}
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
