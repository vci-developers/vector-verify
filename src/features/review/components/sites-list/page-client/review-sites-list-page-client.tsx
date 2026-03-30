'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { SessionState } from '@/api/session/validation/session-schema';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import ErrorBanner from '@/components/ui/error-banner';
import { Separator } from '@/components/ui/separator';
import ReviewSitesListHeader from '@/features/review/components/sites-list/review-sites-list-header';
import ReviewSitesList from '@/features/review/components/sites-list/review-sites-list';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ClipboardList } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ReviewSitesListPageClient() {
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState(() =>
        startOfMonth(new Date()),
    );
    const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions(
            { district: selectedDistrict, startDate, endDate },
            { enabled: !!selectedDistrict },
        );

    const sessionsBySiteId = useMemo(() => {
        const sessionsBySiteIdMap = new Map<
            number,
            { count: number; state?: SessionState }
        >();

        if (!getAllSessionsResult?.ok) {
            return sessionsBySiteIdMap;
        }

        for (const { siteId, state } of getAllSessionsResult.data.sessions) {
            const existingSiteData = sessionsBySiteIdMap.get(siteId);
            sessionsBySiteIdMap.set(siteId, {
                count: (existingSiteData?.count ?? 0) + 1,
                state: existingSiteData?.state ?? state,
            });
        }

        return sessionsBySiteIdMap;
    }, [getAllSessionsResult]);

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return (
            <PageShell
                title="Review"
                description="Loading accessible review sites..."
                icon={ClipboardList}
            >
                <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-6">
                        <p className="text-muted-foreground text-sm">
                            Loading accessible review sites...
                        </p>
                    </CardContent>
                </Card>
            </PageShell>
        );
    }

    if (!getUserPermissionsResult.ok) {
        return (
            <PageShell
                title="Review"
                description="Unable to load review sites"
                icon={ClipboardList}
            >
                <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-6">
                        <ErrorBanner
                            message={
                                getUserPermissionsResult.error.message ??
                                'Unable to load review sites.'
                            }
                        />
                    </CardContent>
                </Card>
            </PageShell>
        );
    }

    const accessibleSites =
        getUserPermissionsResult.data.permissions.sites.canAccessSites;

    const accessibleDistricts = [
        ...new Set(
            accessibleSites
                .map(site => site.district?.trim())
                .filter((district): district is string => Boolean(district)),
        ),
    ].sort();

    const sitesInAccessibleDistrict = selectedDistrict
        ? accessibleSites.filter(
              site => site.district?.trim() === selectedDistrict,
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
                        selectedMonth={selectedMonth}
                        onMonthChange={setSelectedMonth}
                    />

                    <Separator />

                    {!selectedDistrict ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ClipboardList className="text-muted-foreground/50 mb-4 h-12 w-12" />
                            <p className="text-muted-foreground text-sm">
                                Select a district to begin reviewing.
                            </p>
                        </div>
                    ) : isGetAllSessionsPending || !getAllSessionsResult ? (
                        <div className="flex justify-center py-12">
                            <p className="text-muted-foreground text-sm">
                                Loading review sessions...
                            </p>
                        </div>
                    ) : !getAllSessionsResult.ok ? (
                        <ErrorBanner
                            message={
                                getAllSessionsResult.error.message ??
                                'Unable to load review sessions.'
                            }
                        />
                    ) : sitesInAccessibleDistrict.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground text-sm">
                                No sites found for this district.
                            </p>
                        </div>
                    ) : (
                        <ReviewSitesList
                            sites={sitesInAccessibleDistrict}
                            startDate={startDate}
                            endDate={endDate}
                            sessionsBySiteId={sessionsBySiteId}
                        />
                    )}
                </CardContent>
            </Card>
        </PageShell>
    );
}
