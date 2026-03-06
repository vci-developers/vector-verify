'use client';

import { useGetSessions } from '@/api/session/hooks/use-get-sessions';
import type { GetSessionsQueryParams } from '@/api/session/validation/get-sessions-schema';
import type { SessionState } from '@/api/session/validation/session-schema';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import ReviewHouseCard from '@/features/review/components/house-list/review-house-card';

interface HouseReview {
    siteId: number;
    houseNumber: string | undefined;
    sessionCount: number;
    state: SessionState | undefined;
}

interface ReviewHouseListProps {
    district: string;
}

export default function ReviewHouseList({ district }: ReviewHouseListProps) {
    const { data: getUserPermissionsResult, isPending: isGetUserPermissionsPending } =
        useGetUserPermissions();

    const getSessionsQueryParams: GetSessionsQueryParams = {
        district,
        limit: 100,
    };

    const { data: getSessionsResult, isPending: isGetSessionsPending } =
        useGetSessions(getSessionsQueryParams);

    if (isGetUserPermissionsPending || isGetSessionsPending || !getUserPermissionsResult || !getSessionsResult) {
        return <p>LOADING...</p>;
    }

    if (!getUserPermissionsResult.ok) {
        return <p>ERROR: {getUserPermissionsResult.error.message}</p>;
    }

    if (!getSessionsResult.ok) {
        return <p>ERROR: {getSessionsResult.error.message}</p>;
    }

    const accessibleSites = getUserPermissionsResult.data.permissions.sites.canAccessSites;
    const sitesInDistrict = accessibleSites.filter(
        site => site.district?.trim() === district.trim(),
    );

    if (sitesInDistrict.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                No houses found for this district.
            </p>
        );
    }

    const sessionMap = new Map<number, { sessionCount: number; state: SessionState | undefined }>();
    for (const session of getSessionsResult.data.sessions) {
        const existing = sessionMap.get(session.siteId);
        if (existing) {
            existing.sessionCount += 1;
        } else {
            sessionMap.set(session.siteId, {
                sessionCount: 1,
                state: session.state,
            });
        }
    }

    const houses: HouseReview[] = sitesInDistrict.map(site => {
        const sessionData = sessionMap.get(site.siteId);
        return {
            siteId: site.siteId,
            houseNumber: site.houseNumber,
            sessionCount: sessionData?.sessionCount ?? 0,
            state: sessionData?.state,
        };
    });

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map(house => (
                <ReviewHouseCard key={house.siteId} {...house} />
            ))}
        </div>
    );
}
