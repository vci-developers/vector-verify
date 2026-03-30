'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import {
    getSiteTopLevelLocation,
    getSiteLocationLabel,
} from '@/api/site/utils';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ReviewSitesListHeader from '@/features/review/components/sites-list/review-sites-list-header';
import ReviewSitesList from '@/features/review/components/sites-list/review-sites-list';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';

export default function ReviewSitesListPageClient() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState(() =>
        startOfMonth(new Date()),
    );

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

    const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

    const accessibleSites =
        getUserPermissionsResult.data.permissions.sites.canAccessSites;

    const locationLabel = getSiteLocationLabel(accessibleSites);

    const accessibleDistricts = [
        ...new Set(
            accessibleSites
                .map(site => getSiteTopLevelLocation(site))
                .filter((location): location is string => Boolean(location)),
        ),
    ].sort();

    const sitesInAccessibleDistrict = selectedDistrict
        ? accessibleSites.filter(
              site => getSiteTopLevelLocation(site) === selectedDistrict,
          )
        : [];

    return (
        <PageShell
            title="Review"
            description="Review submitted session data by district and month."
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <ReviewSitesListHeader
                        districts={accessibleDistricts}
                        selectedDistrict={selectedDistrict}
                        onDistrictChange={setSelectedDistrict}
                        locationLabel={locationLabel}
                        selectedMonth={selectedMonth}
                        onMonthChange={setSelectedMonth}
                    />

                    <Separator />

                    <ReviewSitesList
                        sites={sitesInAccessibleDistrict}
                        district={selectedDistrict}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}
