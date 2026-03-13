'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Activity } from 'lucide-react';
import OperationsLocationList from './operations-location-list';

export default function OperationsLocationListPageClient() {
    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return (
            <PageShell
                title="Operations"
                description="District-level entomological metrics and session data"
                icon={Activity}
            >
                <p className="text-muted-foreground text-sm">Loading...</p>
            </PageShell>
        );
    }

    if (!getUserPermissionsResult.ok) {
        return (
            <PageShell
                title="Operations"
                description="District-level entomological metrics and session data"
                icon={Activity}
            >
                <p className="text-destructive text-sm">
                    {getUserPermissionsResult.error.message}
                </p>
            </PageShell>
        );
    }

    const sites =
        getUserPermissionsResult.data.permissions.sites.canAccessSites;
    const districtMap = new Map<string, number>();

    for (const site of sites) {
        if (!site.district) continue;
        districtMap.set(
            site.district,
            (districtMap.get(site.district) ?? 0) + 1,
        );
    }

    const locations = Array.from(districtMap.entries()).map(
        ([district, siteCount]) => ({ district, siteCount }),
    );

    return (
        <PageShell
            title="Operations"
            description="District-level entomological metrics and session data"
            icon={Activity}
        >
            {locations.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                    No districts available.
                </p>
            ) : (
                <OperationsLocationList locations={locations} />
            )}
        </PageShell>
    );
}
