'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CompletenessBox } from '@/features/operations/components/site-list/completeness-box';
import { ChevronRight, MapPin } from 'lucide-react';
import { useMemo } from 'react';

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

const HIERARCHY_LEVELS = [
    { key: 'subCounty', label: 'Subcounty' },
    { key: 'healthCenter', label: 'Health Center' },
    { key: 'parish', label: 'Parish' },
    { key: 'villageName', label: 'Village' },
    { key: 'houseNumber', label: 'House' },
] as const;

interface SiteHierarchyProps {
    sites: Site[];
    depth: number;
    parentPath: string;
    siteIdToCounts: Map<
        number,
        { sessionCount: number; needsReviewCount: number }
    >;
    expandedSitePaths: Set<string>;
    onToggle: (path: string) => void;
}

export default function OperationsSiteHierarchy({
    sites,
    depth,
    parentPath,
    siteIdToCounts,
    expandedSitePaths,
    onToggle,
}: SiteHierarchyProps) {
    const currentLevel = HIERARCHY_LEVELS[depth];
    const isLeafLevel = depth === HIERARCHY_LEVELS.length - 1;

    const sortedLocationEntries = useMemo(() => {
        if (!currentLevel) return [];
        const grouped = sites.reduce<Record<string, Site[]>>((groups, site) => {
            const locationName = site[currentLevel.key] ?? 'Unknown';
            groups[locationName] ??= [];
            groups[locationName].push(site);
            return groups;
        }, {});
        return Object.entries(grouped).sort();
    }, [sites, currentLevel]);

    if (!currentLevel) return null;

    if (isLeafLevel) {
        return (
            <div className="space-y-1">
                {sites.map(site => {
                    const { sessionCount, needsReviewCount } =
                        siteIdToCounts.get(site.siteId) ?? {
                            sessionCount: 0,
                            needsReviewCount: 0,
                        };
                    const hasSessions = sessionCount > 0;
                    const hasNeedsReview = needsReviewCount > 0;

                    return (
                        <div
                            key={site.siteId}
                            className="flex items-center justify-between rounded-md px-3 py-2"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                        hasSessions
                                            ? 'bg-primary/10'
                                            : 'bg-muted'
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
                                    {site[currentLevel.key] ?? 'Unknown'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasNeedsReview && (
                                    <Badge variant="destructive">
                                        {`${needsReviewCount} ${needsReviewCount === 1 ? 'needs' : 'need'} review`}
                                    </Badge>
                                )}
                                <Badge
                                    variant={
                                        hasSessions ? 'default' : 'outline'
                                    }
                                >
                                    {hasSessions
                                        ? `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`
                                        : 'No sessions'}
                                </Badge>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {sortedLocationEntries.map(([locationName, sitesInLocation]) => {
                const currentPath = `${parentPath}/${locationName}`;
                const isExpanded = expandedSitePaths.has(currentPath);
                const coveredSites = sitesInLocation.filter(
                    site =>
                        (siteIdToCounts.get(site.siteId)?.sessionCount ?? 0) >
                        0,
                );
                const completenessPercentage =
                    sitesInLocation.length > 0
                        ? Math.round(
                              (coveredSites.length / sitesInLocation.length) *
                                  100,
                          )
                        : 0;
                const needsReviewTotal = sitesInLocation.reduce(
                    (sum, site) =>
                        sum +
                        (siteIdToCounts.get(site.siteId)?.needsReviewCount ??
                            0),
                    0,
                );

                return (
                    <Collapsible
                        key={currentPath}
                        open={isExpanded}
                        onOpenChange={() => onToggle(currentPath)}
                    >
                        <CollapsibleTrigger className="w-full">
                            <div
                                className={`group flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-all ${getCompletenessBackgroundColor(completenessPercentage)}`}
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
                                            {currentLevel.label}
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
                                        {coveredSites.length} of{' '}
                                        {sitesInLocation.length} visited
                                    </span>
                                    <CompletenessBox
                                        percentage={completenessPercentage}
                                    />
                                </div>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="border-border/60 ml-4.5 border-l pl-4">
                                <OperationsSiteHierarchy
                                    sites={sitesInLocation}
                                    depth={depth + 1}
                                    parentPath={currentPath}
                                    siteIdToCounts={siteIdToCounts}
                                    expandedSitePaths={expandedSitePaths}
                                    onToggle={onToggle}
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
