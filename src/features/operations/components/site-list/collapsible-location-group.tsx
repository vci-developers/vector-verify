import type { Site } from '@/api/site/validation/site-schema';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { CompletenessBox } from './completeness-box';

function getCompletenessBackgroundColor(
    percentage: number,
    highThreshold = 80,
    mediumThreshold = 50,
): string {
    if (percentage >= highThreshold) return 'bg-success/10 hover:bg-success/20';
    if (percentage >= mediumThreshold)
        return 'bg-warning/10 hover:bg-warning/20';
    return 'bg-destructive/10 hover:bg-destructive/20';
}

interface CollapsibleLocationGroupProps {
    locationName: string;
    locationTypeName: string;
    sitesInGroup: Site[];
    parentPath: string;
    sessionCountsBySiteId: Map<
        number,
        { sessionCount: number; needsReviewCount: number }
    >;
    expandedSitePaths: Set<string>;
    onToggle: (path: string) => void;
    children: React.ReactNode;
}

export default function CollapsibleLocationGroup({
    locationName,
    locationTypeName,
    sitesInGroup,
    parentPath,
    sessionCountsBySiteId,
    expandedSitePaths,
    onToggle,
    children,
}: CollapsibleLocationGroupProps) {
    const path = `${parentPath}/${locationName}`;
    const isExpanded = expandedSitePaths.has(path);

    const visitedCount = sitesInGroup.filter(
        site => (sessionCountsBySiteId.get(site.siteId)?.sessionCount ?? 0) > 0,
    ).length;
    const visitedPercentage =
        sitesInGroup.length > 0
            ? Math.round((visitedCount / sitesInGroup.length) * 100)
            : 0;
    const needsReviewTotal = sitesInGroup.reduce(
        (sum, site) =>
            sum +
            (sessionCountsBySiteId.get(site.siteId)?.needsReviewCount ?? 0),
        0,
    );

    return (
        <Collapsible open={isExpanded} onOpenChange={() => onToggle(path)}>
            <CollapsibleTrigger className="w-full">
                <div
                    className={`group flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-all ${getCompletenessBackgroundColor(visitedPercentage)}`}
                >
                    <div className="flex items-center gap-2.5">
                        <ChevronRight
                            className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${
                                isExpanded ? 'rotate-90' : ''
                            }`}
                        />
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium">
                                {locationName}
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                                {locationTypeName}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {needsReviewTotal > 0 && (
                            <span className="text-destructive text-xs tabular-nums">
                                {`${needsReviewTotal} ${needsReviewTotal === 1 ? 'needs' : 'need'} review`}
                            </span>
                        )}
                        <span className="text-muted-foreground text-xs tabular-nums">
                            {visitedCount} of {sitesInGroup.length} visited
                        </span>
                        <CompletenessBox percentage={visitedPercentage} />
                    </div>
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
