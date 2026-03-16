'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Microscope } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import OperationsHeader from '@/features/operations/components/operations-header';
import OperationsSitesList from '@/features/operations/components/operations-sites-list';

export default function OperationsPageClient() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined,
    );
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

    const startDate = dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : undefined;
    const endDate = dateRange?.to
        ? format(dateRange.to, 'yyyy-MM-dd')
        : undefined;

    const accessibleSites =
        getUserPermissionsResult.data.permissions.sites.canAccessSites;

    const accessibleDistricts = [
        ...new Set(
            accessibleSites
                .map(site => site.district?.trim())
                .filter((district): district is string => Boolean(district)),
        ),
    ].sort();

    const filteredAccessibleSites = selectedDistrict
        ? accessibleSites.filter(
              site => site.district?.trim() === selectedDistrict,
          )
        : [];

    return (
        <PageShell
            title="Operations"
            description="Monitor field operations by location"
            icon={Microscope}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <OperationsHeader
                        districts={accessibleDistricts}
                        selectedDistrict={selectedDistrict}
                        onDistrictChange={setSelectedDistrict}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        onClearDateRange={() => setDateRange(undefined)}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <Separator />

                    {activeTab === 'sites' && (
                        <Fragment>
                            {selectedDistrict &&
                                filteredAccessibleSites.length > 0 && (
                                    <OperationsSitesList
                                        sites={filteredAccessibleSites}
                                        district={selectedDistrict}
                                        startDate={startDate}
                                        endDate={endDate}
                                    />
                                )}

                            {selectedDistrict &&
                                filteredAccessibleSites.length === 0 && (
                                    <p className="text-muted-foreground py-12 text-center text-sm">
                                        No sites found in {selectedDistrict}.
                                    </p>
                                )}

                            {!selectedDistrict && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Microscope className="text-muted-foreground/50 mb-4 h-12 w-12" />
                                    <p className="text-muted-foreground text-sm">
                                        Select a district to view operations
                                        details.
                                    </p>
                                </div>
                            )}
                        </Fragment>
                    )}
                </CardContent>
            </Card>
        </PageShell>
    );
}
