'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ReviewHouseListHeader from '@/features/review/components/house-list/review-house-list-header';
import ReviewHouseList from '@/features/review/components/house-list/review-house-list';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';

export default function ReviewHouseListPageClient() {
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
        null,
    );
    const [selectedMonth, setSelectedMonth] = useState(() =>
        startOfMonth(new Date()),
    );

    const { data: permissionsResult } = useGetUserPermissions();

    const districts = permissionsResult?.ok
        ? [
              ...new Set(
                  permissionsResult.data.permissions.sites.canAccessSites
                      .map(site => site.district?.trim())
                      .filter((d): d is string => Boolean(d)),
              ),
          ].sort()
        : [];

    const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

    return (
        <PageShell
            title="Review"
            description="Review submitted session data by district and month."
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <ReviewHouseListHeader
                        districts={districts}
                        selectedDistrict={selectedDistrict}
                        onDistrictChange={setSelectedDistrict}
                        selectedMonth={selectedMonth}
                        onMonthChange={setSelectedMonth}
                    />
                    <Separator />
                    <ReviewHouseList
                        district={selectedDistrict}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}
