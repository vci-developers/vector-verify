'use client';

import { useMemo, useState } from 'react';
import type { Site } from '@/api/site/validation/site-schema';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquareIcon } from 'lucide-react';
import OperationsTasksDetailsHeader, { type ViewValue } from './operations-tasks-details-header';
import OperationsDetailsList from './operations-details-list';
import type { DateRange } from 'react-day-picker';

interface ReviewTasksListPageClientProps {
    accessibleSites: Site[];
    district: string;
}

export default function ReviewTasksListPageClient({
    accessibleSites,
    district,
}: ReviewTasksListPageClientProps) {
    const [activeView, setActiveView] = useState<ViewValue>("house");
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const totalItems = useMemo(() => {
        if (activeView === "village") {
            return new Set(
                accessibleSites
                    .map(s => s.villageName?.trim())
                    .filter(Boolean)
            ).size;
        }
        return accessibleSites.filter(s => s.houseNumber?.trim()).length;
    }, [accessibleSites, activeView]);

    return (
        <PageShell
            title="Review Tasks"
            description="Review and annotate"
            icon={CheckSquareIcon}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <OperationsTasksDetailsHeader
                        activeView={activeView}
                        onViewChange={setActiveView}
                        district={district}
                        totalItems={totalItems}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        onClearDateRange={() => setDateRange(undefined)}
                    />


                    <OperationsDetailsList
                        accessibleSites={accessibleSites}
                        activeView={activeView}
                    />

                </CardContent>
            </Card>
        </PageShell>
    );
}