'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Microscope } from 'lucide-react';
import { useMemo } from 'react';
import OperationsLocationPage from '../operations-location-page';

interface OperationsLocationPageClientProps {
    district: string;
}

export default function OperationsLocationPageClient({
    district,
}: OperationsLocationPageClientProps) {
    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    const accessibleSites = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites
        : [];

    const sitesInDistrict = accessibleSites.filter(
        site => site.district?.trim() === district,
    );

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions(
            { district },
            {
                enabled:
                    getUserPermissionsResult?.ok === true &&
                    sitesInDistrict.length > 0,
            },
        );

    const siteIdToSessionCounts = useMemo(() => {
        const counts = new Map<number, number>();

        if (!getAllSessionsResult?.ok) {
            return counts;
        }

        for (const session of getAllSessionsResult.data.sessions) {
            counts.set(session.siteId, (counts.get(session.siteId) ?? 0) + 1);
        }

        return counts;
    }, [getAllSessionsResult]);

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return (
            <PageShell
                title={`Operations - ${district}`}
                description="Monitor field operations for this district"
                icon={Microscope}
            >
                <p className="text-muted-foreground text-sm">
                    Loading district details...
                </p>
            </PageShell>
        );
    }

    if (!getUserPermissionsResult.ok) {
        return (
            <PageShell
                title={`Operations - ${district}`}
                description="Monitor field operations for this district"
                icon={Microscope}
            >
                <p className="text-destructive text-sm">
                    {getUserPermissionsResult.error.message}
                </p>
            </PageShell>
        );
    }

    if (sitesInDistrict.length > 0) {
        if (isGetAllSessionsPending || !getAllSessionsResult) {
            return (
                <PageShell
                    title={`Operations - ${district}`}
                    description="Monitor field operations for this district"
                    icon={Microscope}
                >
                    <p className="text-muted-foreground text-sm">
                        Loading district details...
                    </p>
                </PageShell>
            );
        }

        if (!getAllSessionsResult.ok) {
            return (
                <PageShell
                    title={`Operations - ${district}`}
                    description="Monitor field operations for this district"
                    icon={Microscope}
                >
                    <p className="text-destructive text-sm">
                        {getAllSessionsResult.error.message}
                    </p>
                </PageShell>
            );
        }
    }

    return (
        <OperationsLocationPage
            district={district}
            sites={sitesInDistrict}
            siteIdToSessionCounts={siteIdToSessionCounts}
        />
    );
}
