'use client';

import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    getSiteSessionCount,
    type ReviewSiteSessionSummary,
} from '@/features/review/utils/review-site-session-summary';
import { cn } from '@/utils/cn';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const HIGH_VISIT_COVERAGE_PERCENT = 80;
const MEDIUM_VISIT_COVERAGE_PERCENT = 50;

function getCoverageTintClass(visitedPercentage: number): string {
    if (visitedPercentage >= HIGH_VISIT_COVERAGE_PERCENT) {
        return 'bg-success/10 hover:bg-success/20';
    }
    if (visitedPercentage >= MEDIUM_VISIT_COVERAGE_PERCENT) {
        return 'bg-warning/10 hover:bg-warning/20';
    }
    return 'bg-destructive/10 hover:bg-destructive/20';
}

function getCoverageBadgeClass(visitedPercentage: number): string {
    if (visitedPercentage >= HIGH_VISIT_COVERAGE_PERCENT) {
        return 'bg-success/10 text-success border-success/50';
    }
    if (visitedPercentage >= MEDIUM_VISIT_COVERAGE_PERCENT) {
        return 'bg-warning/20 text-warning border-warning/50';
    }
    return 'bg-destructive/20 text-destructive border-destructive/50';
}

interface ReviewCollapsibleLocationGroupProps {
    locationName: string;
    locationTypeName: string;
    siteIds: number[];
    sessionSummaryBySiteId: Map<number, ReviewSiteSessionSummary>;
    defaultOpen: boolean;
    children: React.ReactNode;
}

export default function ReviewCollapsibleLocationGroup({
    locationName,
    locationTypeName,
    siteIds,
    sessionSummaryBySiteId,
    defaultOpen,
    children,
}: ReviewCollapsibleLocationGroupProps) {
    const t = useTranslations('ReviewSitesList');
    const [isExpanded, setIsExpanded] = useState(defaultOpen);

    let visitedSiteCount = 0;
    let needsReviewSiteCount = 0;
    for (const siteId of siteIds) {
        const summary = sessionSummaryBySiteId.get(siteId);
        if (summary === undefined) continue;
        if (getSiteSessionCount(summary) > 0) visitedSiteCount += 1;
        if (summary.NEEDS_REVIEW > 0) needsReviewSiteCount += 1;
    }
    const totalSiteCount = siteIds.length;
    const visitedPercentage =
        totalSiteCount > 0
            ? Math.round((visitedSiteCount / totalSiteCount) * 100)
            : 0;

    return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger
                className={cn(
                    'group flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all',
                    getCoverageTintClass(visitedPercentage),
                )}
            >
                <div className="flex items-center gap-2.5">
                    <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    <span className="text-sm font-medium">{locationName}</span>
                    <span className="text-muted-foreground text-[11px]">
                        {locationTypeName}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {needsReviewSiteCount > 0 && (
                        <span className="text-destructive text-xs tabular-nums">
                            {t('sitesNeedReview', {
                                count: needsReviewSiteCount,
                            })}
                        </span>
                    )}
                    <span className="text-muted-foreground text-xs tabular-nums">
                        {t('sitesVisited', {
                            visited: visitedSiteCount,
                            total: totalSiteCount,
                        })}
                    </span>
                    <Badge
                        variant="outline"
                        className={getCoverageBadgeClass(visitedPercentage)}
                    >
                        {visitedPercentage}%
                    </Badge>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="border-border/60 ml-4.5 border-l pl-4">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
