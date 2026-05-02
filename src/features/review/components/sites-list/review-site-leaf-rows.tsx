import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { endOfMonth, format, parseISO } from 'date-fns';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';

interface ReviewSiteLeafRowsProps {
    sites: Site[];
    getDisplayName: (site: Site) => string;
    parentPath: string;
    sessionCountsBySiteId: Map<
        number,
        { sessionCount: number; needsReviewCount: number }
    >;
}

export default function ReviewSiteLeafRows({
    sites,
    getDisplayName,
    parentPath,
    sessionCountsBySiteId,
}: ReviewSiteLeafRowsProps) {
    const startDate = `${parentPath.split('/')[0]}-01`;
    const endDate = format(endOfMonth(parseISO(startDate)), 'yyyy-MM-dd');

    return (
        <div className="space-y-1">
            {sites.map(site => {
                const { sessionCount, needsReviewCount } =
                    sessionCountsBySiteId.get(site.siteId) ?? {
                        sessionCount: 0,
                        needsReviewCount: 0,
                    };
                const hasSessions = sessionCount > 0;
                const href = `/review/${site.siteId}?startDate=${startDate}&endDate=${endDate}`;

                const rowClassName = cn(
                    'flex items-center justify-between rounded-md px-3 py-2',
                    hasSessions
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
                            <Badge
                                variant={hasSessions ? 'default' : 'outline'}
                            >
                                {hasSessions
                                    ? `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`
                                    : 'No sessions'}
                            </Badge>
                        </div>
                    </Fragment>
                );

                if (hasSessions) {
                    return (
                        <Link
                            key={site.siteId}
                            href={href}
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
