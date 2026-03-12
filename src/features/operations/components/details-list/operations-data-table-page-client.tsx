'use client';

import { useState } from 'react';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Microscope } from 'lucide-react';
export type ViewValue = "village" | "house" | "";
import type { DateRange } from 'react-day-picker';
import OperationsDataHeader from './operations-data-header';
import OperationsDataTable from './operations-data-table';


interface OperationsDataTablePageClientProps {
    district: string;
}

export default function OperationsDataTablePageClient({
    district,
}: OperationsDataTablePageClientProps) {
    const [activeView, setActiveView] = useState<ViewValue>("house");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const { data: getUserPermissionsResult } = useGetUserPermissions();

    const accessibleSites = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites.filter(
            site => site.district?.toLowerCase() === district.toLowerCase()
        )
        : [];

    const totalItems = activeView === "village"
        ? new Set(accessibleSites.map(s => s.villageName?.trim()).filter(Boolean)).size
        : accessibleSites.filter(s => s.houseNumber?.trim()).length;

    return (
        <PageShell
            title="Operations Details"
            description="View operations details for each district"
            icon={Microscope}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <OperationsDataHeader
                        activeView={activeView}
                        onViewChange={setActiveView}
                        district={district}
                        totalItems={totalItems}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        onClearDateRange={() => setDateRange(undefined)}
                    />


                    <OperationsDataTable
                        accessibleSites={accessibleSites}
                        activeView={activeView}
                    />

                </CardContent>
            </Card>
        </PageShell>
    );
}
