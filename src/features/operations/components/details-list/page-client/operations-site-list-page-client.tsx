'use client';

import { useState } from 'react';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Microscope } from 'lucide-react';
import OperationsDataHeader from '../operations-site-list-header';
import OperationsSiteList from '../operations-site-list';

export default function OperationsSiteListPageClient() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [activeTab, setActiveTab] = useState('sites');
    const [startDate, setStartDate] = useState<string | undefined>(undefined);
    const [endDate, setEndDate] = useState<string | undefined>(undefined);

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

    const filteredSites = selectedDistrict
        ? accessibleSites.filter(site => site.district?.trim() === selectedDistrict)
        : accessibleSites;

    const accessibleDistricts = [
        ...new Set(
            accessibleSites
                .map(site => site.district?.trim())
                .filter((district): district is string => Boolean(district)),
        ),
    ].sort();

    function handleDateRangeChange(newStartDate?: string, newEndDate?: string) {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    }

    return (
        <PageShell
            title="Operations"
            description="Monitor field operations by location"
            icon={Microscope}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <OperationsDataHeader
                        districts={accessibleDistricts}
                        selectedDistrict={selectedDistrict}
                        onDistrictChange={setSelectedDistrict}
                        onDateRangeChange={handleDateRangeChange}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <OperationsSiteList
                        sites={filteredSites}
                        district={selectedDistrict}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}
