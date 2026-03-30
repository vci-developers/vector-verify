'use client';

import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Microscope } from 'lucide-react';
import OperationsDataHeader from '../operations-site-list-header';
import OperationsSiteList from '../operations-site-list';

export default function OperationsSiteListPageClient() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [activeTab, setActiveTab] = useState('sites');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined,
    );

    const startDate = dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : undefined;
    const endDate = dateRange?.to
        ? format(dateRange.to, 'yyyy-MM-dd')
        : undefined;

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
                    <OperationsDataHeader
                        districts={accessibleDistricts}
                        selectedDistrict={selectedDistrict}
                        onDistrictChange={setSelectedDistrict}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        onClearDateRange={() => setDateRange(undefined)}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <OperationsSiteList
                        sites={filteredAccessibleSites}
                        district={selectedDistrict}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}
