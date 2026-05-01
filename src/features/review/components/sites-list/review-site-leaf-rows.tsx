import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Lock, MapPin } from 'lucide-react';
import Link from 'next/link';
import {
    getReviewSiteStatus,
    isReviewSiteLocked,
    type ReviewSiteSessionSummary,
} from './review-site-session-summary';

interface ReviewSiteLeafRowsProps {
    sites: Site[];
    getDisplayName: (site: Site) => string;
    sessionCountsBySiteId: Map<number, ReviewSiteSessionSummary>;
    startDate: string;
    endDate: string;
}

const EMPTY_SESSION_SUMMARY: ReviewSiteSessionSummary = {
    sessionCount: 0,
    needsReviewCount: 0,
    stateCounts: {},
};

const STATUS_VARIANTS = {
    NEEDS_REVIEW: 'destructive',
    IN_REVIEW: 'outline',
    CERTIFIED: 'default',
    SUBMITTED: 'secondary',
    NOT_APPLICABLE: 'secondary',
    LOCKED: 'secondary',
} as const;

const STATUS_LABELS = {
    NEEDS_REVIEW: 'Needs review',
    IN_REVIEW: 'In review',
    CERTIFIED: 'Certified',
    SUBMITTED: 'Submitted',
    NOT_APPLICABLE: 'Not applicable',
    LOCKED: 'Locked',
} as const;

function buildReviewHref(site: Site, startDate: string, endDate: string) {
    const districtPath = encodeURIComponent(site.district ?? 'location');
    const queryParams = new URLSearchParams({ startDate, endDate });
    return `/review/${districtPath}/${site.siteId}?${queryParams.toString()}`;
}

export default function ReviewSiteLeafRows({
    sites,
    getDisplayName,
    sessionCountsBySiteId,
    startDate,
    endDate,
}: ReviewSiteLeafRowsProps) {
    return (
        <div className="space-y-1">
            {sites.map(site => {
                const sessionSummary =
                    sessionCountsBySiteId.get(site.siteId) ??
                    EMPTY_SESSION_SUMMARY;
                const { sessionCount, needsReviewCount } = sessionSummary;
                const hasSessions = sessionCount > 0;
                const isLocked = isReviewSiteLocked(sessionSummary);
                const status = hasSessions
                    ? getReviewSiteStatus(sessionSummary)
                    : undefined;
                const statusBadge =
                    status && status !== 'NEEDS_REVIEW' ? (
                        <Badge variant={STATUS_VARIANTS[status]}>
                            {STATUS_LABELS[status]}
                        </Badge>
                    ) : null;

                const rowContent = (
                    <div
                        className={`flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
                            isLocked
                                ? 'cursor-not-allowed opacity-60'
                                : 'hover:bg-muted/50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    hasSessions ? 'bg-primary/10' : 'bg-muted'
                                }`}
                            >
                                <MapPin
                                    className={`h-4 w-4 ${
                                        hasSessions
                                            ? 'text-primary'
                                            : 'text-muted-foreground'
                                    }`}
                                />
                            </div>
                            <span className="text-sm">
                                {getDisplayName(site)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {needsReviewCount > 0 && (
                                <Badge variant="destructive">
                                    {`${needsReviewCount} ${needsReviewCount === 1 ? 'needs' : 'need'} review`}
                                </Badge>
                            )}
                            {statusBadge}
                            <Badge
                                variant={hasSessions ? 'default' : 'outline'}
                            >
                                {hasSessions
                                    ? `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`
                                    : 'No sessions'}
                            </Badge>
                            {hasSessions && isLocked && (
                                <span className="text-muted-foreground hidden text-xs sm:inline">
                                    No further changes
                                </span>
                            )}
                            {isLocked ? (
                                <Lock className="text-muted-foreground h-4 w-4" />
                            ) : (
                                <ChevronRight className="text-muted-foreground h-4 w-4" />
                            )}
                        </div>
                    </div>
                );

                if (isLocked) {
                    return <div key={site.siteId}>{rowContent}</div>;
                }

                return (
                    <Link
                        key={site.siteId}
                        href={buildReviewHref(site, startDate, endDate)}
                    >
                        {rowContent}
                    </Link>
                );
            })}
        </div>
    );
}
