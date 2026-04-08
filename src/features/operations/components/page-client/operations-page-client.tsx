'use client';

import { useState } from 'react';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Microscope } from 'lucide-react';
import OperationsAiPerformanceTab from '../ai-performance/operations-ai-performance-tab';
import OperationsMetrics from '../location/metrics/operations-metrics';
import OperationsHeader from '../site-list/operations-header';
import OperationsSiteList from '../site-list/operations-site-list';

function DistrictTabEmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-sm">{message}</p>
            <Microscope className="text-muted-foreground/50 mt-4 h-12 w-12" />
        </div>
    );
}

export default function OperationsPageClient() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [activeTab, setActiveTab] = useState('sites');
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
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-4"
                    >
                        <OperationsHeader
                            districts={accessibleDistricts}
                            selectedDistrict={selectedDistrict}
                            onDistrictChange={setSelectedDistrict}
                            selectedMonth={selectedMonth}
                            onMonthChange={setSelectedMonth}
                        />

                        <TabsContent value="sites" className="mt-0">
                            <OperationsSiteList
                                sites={filteredAccessibleSites}
                                district={selectedDistrict}
                                startDate={startDate}
                                endDate={endDate}
                            />
                        </TabsContent>

                        <TabsContent value="review" className="mt-0">
                            <DistrictTabEmptyState message="Review is not wired into the operations dashboard yet." />
                        </TabsContent>

                        <TabsContent value="metrics" className="mt-0">
                            {selectedDistrict ? (
                                <OperationsMetrics />
                            ) : (
                                <DistrictTabEmptyState message="Select a district to view district-level metrics." />
                            )}
                        </TabsContent>

                        <TabsContent value="ai-performance" className="mt-0">
                            <OperationsAiPerformanceTab />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </PageShell>
    );
}
