'use client';

import { Fragment, useState } from 'react';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Microscope } from 'lucide-react';
import OperationsMetrics from '@/features/operations/components/metrics/operations-metrics';
import OperationsSiteList from '@/features/operations/components/site-list/operations-site-list';
import { Separator } from '@/components/ui/separator';
import OperationsHeader from '@/features/operations/components/layout/operations-header';
import OperationsAiPerformanceTab from '@/features/operations/components/ai-performance/operations-ai-performance-tab';
import { SkeletonList } from '@/components/ui/skeleton-list';

const OPERATIONS_TABS = [
    { value: 'sites', label: 'SITES' },
    { value: 'metrics', label: 'METRICS' },
    { value: 'ai-performance', label: 'AI PERFORMANCE' },
] as const;

export type OperationsTab = (typeof OPERATIONS_TABS)[number]['value'];

export default function OperationsPageClient() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [activeTab, setActiveTab] = useState<OperationsTab>('sites');
    const [selectedMonth, setSelectedMonth] = useState(() =>
        startOfMonth(new Date()),
    );

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

    const filteredAccessibleSites = selectedDistrict
        ? accessibleSites.filter(
              site => site.district?.trim() === selectedDistrict,
          )
        : accessibleSites;

    const accessibleDistricts = [
        ...new Set(
            accessibleSites
                .map(site => site.district?.trim())
                .filter((district): district is string => Boolean(district)),
        ),
    ].sort();

    const startDate = format(selectedMonth, 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

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
                        districts={accessibleDistricts}
                        selectedDistrict={selectedDistrict}
                        onDistrictChange={setSelectedDistrict}
                        selectedMonth={selectedMonth}
                        onMonthChange={setSelectedMonth}
                    />

                    <Separator />

                    {!selectedDistrict ? (
                        <div className="relative">
                            <SkeletonList count={5} height="xl" width="full" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <Microscope className="text-muted-foreground/50 mb-4 h-12 w-12" />
                                <p className="text-muted-foreground text-sm">
                                    Select a district to view data.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Fragment>
                            {activeTab === 'sites' && (
                                <OperationsSiteList
                                    sites={filteredAccessibleSites}
                                    district={selectedDistrict}
                                    startDate={startDate}
                                    endDate={endDate}
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
        </PageShell>
    );
}
