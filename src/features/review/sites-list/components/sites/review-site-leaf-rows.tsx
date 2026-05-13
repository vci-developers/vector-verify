import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { Lock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { type ReviewSiteSessionSummary } from '../../utils/review-site-session-summary';
import { Fragment } from 'react';
import { useReviewSiteListMonthKey } from '../../hooks/use-review-sites-list-month-key';
import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';

interface ReviewSiteLeafRowsProps {
    sites: Site[];
    getDisplayName: (site: Site) => string;
    sessionCountsBySiteId: Map<number, ReviewSiteSessionSummary>;
}

function buildReviewHref(site: Site, startDate: string, endDate: string) {
    const queryParams = new URLSearchParams({ startDate, endDate });
    return `/review/${site.siteId}?${queryParams.toString()}`;
}

export default function ReviewSiteLeafRows({
    sites,
    getDisplayName,
    sessionCountsBySiteId,
}: ReviewSiteLeafRowsProps) {
    const monthKey = useReviewSiteListMonthKey();
    const startDate = format(startOfMonth(parseISO(monthKey)), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(parseISO(monthKey)), 'yyyy-MM-dd');

    return (
        <div className="space-y-1">
            {sites.map(site => {
                const {
                    sessionCount,
                    needsReviewCount,
                    isLocked,
                    isCertified,
                } = sessionCountsBySiteId.get(site.siteId) ?? {
                    sessionCount: 0,
                    needsReviewCount: 0,
                    isLocked: false,
                    isCertified: false,
                };
                const hasSessions = sessionCount > 0;
                const rowClassName = cn(
                    'flex items-center justify-between rounded-md px-3 py-2',
                    hasSessions && !isLocked
                        ? 'cursor-pointer hover:bg-muted/50'
                        : 'cursor-not-allowed opacity-60',
                );

                const rowContent = (
                    <Fragment>
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
                            {isCertified ? (
                                <Badge variant="default">Certified</Badge>
                            ) : (
                                <Badge
                                    variant={
                                        hasSessions ? 'default' : 'outline'
                                    }
                                >
                                    {hasSessions
                                        ? `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`
                                        : 'No sessions'}
                                </Badge>
                            )}
                            {isLocked && (
                                <Lock className="text-muted-foreground h-4 w-4" />
                            )}
                        </div>
                    </Fragment>
                );

                if (hasSessions && !isLocked) {
                    return (
                        <Link
                            key={site.siteId}
                            href={buildReviewHref(site, startDate, endDate)}
                            className={rowClassName}
                        >
                            {rowContent}
                        </Link>
                    );
                }

                return (
                    <div key={site.siteId} className={rowClassName}>
                        {rowContent}
                    </div>
                );
            })}
        </div>
    );
}
