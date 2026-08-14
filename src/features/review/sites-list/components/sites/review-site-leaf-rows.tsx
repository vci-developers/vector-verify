'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import {
    getSiteOverallReviewState,
    getSiteSessionCount,
    REVIEW_STATE_LABEL_KEY,
    REVIEW_STATE_SEVERITY_ORDER,
    type ReviewSiteSessionSummary,
} from '@/features/review/utils/review-site-session-summary';
import { cn } from '@/utils/cn';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const REVIEW_STATE_BADGE_VARIANT: Record<
    (typeof REVIEW_STATE_SEVERITY_ORDER)[number],
    'destructive' | 'outline' | 'default' | 'secondary'
> = {
    NEEDS_REVIEW: 'destructive',
    IN_REVIEW: 'outline',
    CERTIFIED: 'default',
    SUBMITTED: 'secondary',
};

interface ReviewSiteLeafRowsProps {
    sites: Site[];
    visibleSiteIds?: Set<number>;
    getDisplayName: (site: Site) => string;
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>;
    buildSiteHref?: (siteId: number) => string;
}

export default function ReviewSiteLeafRows({
    sites,
    visibleSiteIds,
    getDisplayName,
    summaryBySiteId,
    buildSiteHref,
}: ReviewSiteLeafRowsProps) {
    const t = useTranslations('ReviewSitesList');

    const visibleSites =
        visibleSiteIds === undefined
            ? sites
            : sites.filter(site => visibleSiteIds.has(site.siteId));

    return (
        <div className="space-y-1">
            {visibleSites.map(site => {
                const displayName = getDisplayName(site);
                const summary = summaryBySiteId.get(site.siteId);
                const hasSessions =
                    summary !== undefined && getSiteSessionCount(summary) > 0;
                const overallState = summary
                    ? getSiteOverallReviewState(summary)
                    : null;

                const rowHeader = (
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                                hasSessions ? 'bg-primary/10' : 'bg-muted',
                            )}
                        >
                            <MapPin
                                className={cn(
                                    'h-4 w-4',
                                    hasSessions
                                        ? 'text-primary'
                                        : 'text-muted-foreground',
                                )}
                            />
                        </div>
                        <span className="text-sm">{displayName}</span>
                    </div>
                );

                const statusBadge = overallState ? (
                    <Badge variant={REVIEW_STATE_BADGE_VARIANT[overallState]}>
                        {t(REVIEW_STATE_LABEL_KEY[overallState])}
                    </Badge>
                ) : (
                    <Badge variant="outline">{t('noSessions')}</Badge>
                );

                const href = hasSessions
                    ? buildSiteHref?.(site.siteId)
                    : undefined;

                if (href !== undefined) {
                    return (
                        <Link
                            key={site.siteId}
                            href={href}
                            className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-md px-3 py-2"
                        >
                            {rowHeader}
                            {statusBadge}
                        </Link>
                    );
                }

                return (
                    <div
                        key={site.siteId}
                        className={cn(
                            'flex items-center justify-between gap-3 rounded-md px-3 py-2',
                            !hasSessions && 'opacity-60',
                        )}
                    >
                        {rowHeader}
                        {statusBadge}
                    </div>
                );
            })}
        </div>
    );
}
