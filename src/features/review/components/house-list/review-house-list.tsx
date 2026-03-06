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
    district: string | null;
    startDate: string;
    endDate: string;
}

export default function ReviewHouseList({
    district,
    startDate,
    endDate,
}: ReviewHouseListProps) {
    const {
        data: permissionsResult,
        isPending: isPermissionsPending,
    } = useGetUserPermissions();

    const queryParams: GetSessionsQueryParams = {
        ...(district && { district }),
        startDate,
        endDate,
        limit: 100,
    };

    const {
        data: sessionsResult,
        isPending: isSessionsPending,
    } = useGetSessions(queryParams, { enabled: !!district });

    if (!district) {
        return (
            <p className="text-muted-foreground text-sm">
                Select a district to begin reviewing.
            </p>
        );
    }

    if (
        isPermissionsPending ||
        isSessionsPending ||
        !permissionsResult ||
        !sessionsResult
    ) {
        return <h1>LOADING...</h1>;
    }

    if (!permissionsResult.ok) {
        return <h1>ERROR: {permissionsResult.error.message}</h1>;
    }

    if (!sessionsResult.ok) {
        return <h1>ERROR: {sessionsResult.error.message}</h1>;
    }

    const sitesInDistrict =
        permissionsResult.data.permissions.sites.canAccessSites.filter(
            site => site.district?.trim() === district.trim(),
        );

    if (sitesInDistrict.length === 0) {
        return <h1>No houses found for this district.</h1>;
    }

    const sessionMap = new Map<
        number,
        { sessionCount: number; state: SessionState | undefined }
    >();

    for (const session of sessionsResult.data.sessions) {
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
