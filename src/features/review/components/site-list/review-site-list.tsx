'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Session, SessionState } from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import ReviewSiteCard from '@/features/review/components/site-list/review-site-card';
import { useRouter } from 'next/navigation';

const STATE_PRIORITY: Record<SessionState, number> = {
    NEEDS_REVIEW: 4,
    IN_REVIEW: 3,
    CERTIFIED: 2,
    SUBMITTED: 1,
    NOT_APPLICABLE: 0,
};

type SiteSessionSummary = { sessionCount: number; state: SessionState | undefined };

function buildSessionMap(sessions: Session[]): Map<number, SiteSessionSummary> {
    const sessionMap = new Map<number, SiteSessionSummary>();

    for (const session of sessions) {
        const existing = sessionMap.get(session.siteId);
        if (existing) {
            existing.sessionCount += 1;
            if (
                session.state !== undefined &&
                (existing.state === undefined ||
                    STATE_PRIORITY[session.state] > STATE_PRIORITY[existing.state])
            ) {
                existing.state = session.state;
            }
        } else {
            sessionMap.set(session.siteId, { sessionCount: 1, state: session.state });
        }
    }

    return sessionMap;
}

interface ReviewSiteListProps {
    sites: Site[];
    district: string | null;
    startDate: string;
    endDate: string;
}

export default function ReviewSiteList({
    sites,
    district,
    startDate,
    endDate,
}: ReviewSiteListProps) {
    const router = useRouter();

    const {
        data: getAllSessionsResult,
        isPending: isGetAllSessionsPending,
    } = useGetAllSessions(
        { district: district ?? '', startDate, endDate },
        { enabled: !!district },
    );

    if (!district) {
        return (
            <p className="text-muted-foreground text-sm">
                Select a district to begin reviewing.
            </p>
        );
    }

    if (isGetAllSessionsPending || !getAllSessionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getAllSessionsResult.ok) {
        return <h1>ERROR: {getAllSessionsResult.error.message}</h1>;
    }

    if (sites.length === 0) {
        return <h1>No sites found for this district.</h1>;
    }

    const sessionMap = buildSessionMap(getAllSessionsResult.data.sessions);

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map(site => {
                const sessionData = sessionMap.get(site.siteId);
                return (
                    <ReviewSiteCard
                        key={site.siteId}
                        site={site}
                        sessionCount={sessionData?.sessionCount ?? 0}
                        state={sessionData?.state}
                        onClick={() =>
                            router.push(
                                `/review/${district}/${site.siteId}`,
                            )
                        }
                    />
                );
            })}
        </div>
    );
}
