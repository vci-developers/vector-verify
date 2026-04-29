import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

interface ReviewSiteLeafRowsProps {
    sites: Site[];
    getDisplayName: (site: Site) => string;
    monthKey: string;
    sessionCountsBySiteId: Map<
        number,
        { sessionCount: number; needsReviewCount: number }
    >;
}

export default function ReviewSiteLeafRows({
    sites,
    getDisplayName,
    monthKey,
    sessionCountsBySiteId,
}: ReviewSiteLeafRowsProps) {
    return (
        <div className="space-y-1">
            {sites.map(site => {
                const { sessionCount, needsReviewCount } =
                    sessionCountsBySiteId.get(site.siteId) ?? {
                        sessionCount: 0,
                        needsReviewCount: 0,
                    };
                const hasSessions = sessionCount > 0;
                const href = `/review/${site.district}/${site.siteId}?month=${monthKey}-01`;

                return (
                    <Link
                        key={site.siteId}
                        href={hasSessions ? href : '#'}
                        className={`flex items-center justify-between rounded-md px-3 py-2 ${hasSessions ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
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
                            <Badge
                                variant={hasSessions ? 'default' : 'outline'}
                            >
                                {hasSessions
                                    ? `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`
                                    : 'No sessions'}
                            </Badge>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
