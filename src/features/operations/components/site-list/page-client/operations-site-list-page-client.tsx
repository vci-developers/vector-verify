'use client';

import { useState } from 'react';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Microscope } from 'lucide-react';
import OperationsMetricsTab from '../../location/metrics/operations-metrics-tab';
import OperationsDataHeader from '../operations-site-list-header';
import OperationsSiteList from '../operations-site-list';

interface OperationsSiteListPageClientProps {
    initialDistrict?: string;
}

function DistrictTabEmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-sm">{message}</p>
            <Microscope className="text-muted-foreground/50 mt-4 h-12 w-12" />
        </div>
    );
}

export default function OperationsSiteListPageClient({
    initialDistrict = '',
}: OperationsSiteListPageClientProps) {
    const [selectedDistrict, setSelectedDistrict] =
        useState<string>(initialDistrict);
    const [activeTab, setActiveTab] = useState('sites');

    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getUserPermissionsResult.ok) {
        return <h1>ERROR: {getUserPermissionsResult.error.message}</h1>;
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
                        <OperationsDataHeader
                            districts={accessibleDistricts}
                            selectedDistrict={selectedDistrict}
                            onDistrictChange={setSelectedDistrict}
                        />

                        <TabsContent value="sites" className="mt-0">
                            <OperationsSiteList
                                sites={filteredAccessibleSites}
                                district={selectedDistrict}
                            />
                        </TabsContent>

                        <TabsContent value="review" className="mt-0">
                            <DistrictTabEmptyState message="Review is not wired into the operations dashboard yet." />
                        </TabsContent>

                        <TabsContent value="metrics" className="mt-0">
                            {selectedDistrict ? (
                                <OperationsMetricsTab />
                            ) : (
                                <DistrictTabEmptyState message="Select a district to view district-level metrics." />
                            )}
                        </TabsContent>

                        <TabsContent value="ai-performance" className="mt-0">
                            <DistrictTabEmptyState
                                message={
                                    selectedDistrict
                                        ? 'AI Performance is coming soon.'
                                        : 'Select a district to view AI performance.'
                                }
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </PageShell>
    );
}
