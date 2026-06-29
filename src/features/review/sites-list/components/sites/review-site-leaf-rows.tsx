'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import {
    getSiteSessionCount,
    type ReviewSiteSessionSummary,
} from '@/features/review/utils/review-site-session-summary';
import { cn } from '@/utils/cn';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReviewSiteLeafRowsProps {
    sites: Site[];
    getDisplayName: (site: Site) => string;
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>;
}

export default function ReviewSiteLeafRows({
    sites,
    getDisplayName,
    summaryBySiteId,
}: ReviewSiteLeafRowsProps) {
    const t = useTranslations('ReviewSitesList');

    return (
        <div className="space-y-1">
            {sites.map(site => {
                const summary = summaryBySiteId.get(site.siteId);
                const sessionCount = summary ? getSiteSessionCount(summary) : 0;
                const hasSessions = sessionCount > 0;

                return (
                    <div
                        key={site.siteId}
                        className={cn(
                            'flex items-center justify-between rounded-md px-3 py-2',
                            hasSessions ? 'hover:bg-muted/50' : 'opacity-60',
                        )}
                    >
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
                        <Badge variant={hasSessions ? 'default' : 'outline'}>
                            {hasSessions
                                ? t('sessionCount', { count: sessionCount })
                                : t('noSessions')}
                        </Badge>
                    </div>
                );
            })}
        </div>
    );
}
