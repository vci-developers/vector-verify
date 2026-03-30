'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { getSiteTopLevelLocation } from '@/api/site/utils';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CompletenessBox } from '@/features/operations/components/site-list/completeness-box';
import { ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
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

const LEGACY_HIERARCHY_LEVELS = [
    { key: 'subCounty', label: 'Subcounty' },
    { key: 'healthCenter', label: 'Health Center' },
    { key: 'parish', label: 'Parish' },
    { key: 'villageName', label: 'Village' },
    { key: 'houseNumber', label: 'House' },
];

export function getHierarchyLevels(
    sites: Site[],
): { key: string; label: string }[] {
    const firstSite = sites[0];
    if (!firstSite) return LEGACY_HIERARCHY_LEVELS;

    const hierarchyKeys = Object.keys(firstSite.locationHierarchy);
    if (hierarchyKeys.length > 0) {
        return hierarchyKeys.slice(1).map(key => ({ key, label: key }));
    }

    return LEGACY_HIERARCHY_LEVELS;
}

function getSiteValueAtLevel(site: Site, levelKey: string): string | undefined {
    const hierarchyKeys = Object.keys(site.locationHierarchy);
    if (hierarchyKeys.length > 0) {
        return site.locationHierarchy[levelKey];
    }
    return (site as Record<string, unknown>)[levelKey] as string | undefined;
}


interface SiteHierarchyProps {
    sites: Site[];
    depth: number;
    parentPath: string;
    siteIdToSessionCounts: Map<number, number>;
    expandedSitePaths: Set<string>;
    onToggle: (path: string) => void;
    hierarchyLevels: { key: string; label: string }[];
}

export default function SiteHierarchy({
    sites,
    depth,
    parentPath,
    siteIdToSessionCounts,
    expandedSitePaths,
    onToggle,
    hierarchyLevels,
}: SiteHierarchyProps) {
    const currentLevel = hierarchyLevels[depth];
    const isLeafLevel = depth === hierarchyLevels.length - 1;

    const sortedLocationEntries = useMemo(() => {
        if (!currentLevel) return [];
        const grouped = sites.reduce<Record<string, Site[]>>((groups, site) => {
            const locationName =
                getSiteValueAtLevel(site, currentLevel.key) ?? 'Unknown';
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
                    const sessionCount =
                        siteIdToSessionCounts.get(site.siteId) ?? 0;
                    const hasSessions = sessionCount > 0;

                    return (
                        <Link
                            key={site.siteId}
                            href={`/operations/${getSiteTopLevelLocation(site)}/${site.siteId}`}
                        >
                            <div className="group hover:bg-muted/50 flex items-center justify-between rounded-md px-3 py-2 transition-colors">
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
                                        {getSiteValueAtLevel(
                                            site,
                                            currentLevel.key,
                                        ) ?? 'Unknown'}
                                    </span>
                                </div>
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
                        </Link>
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
                    site => (siteIdToSessionCounts.get(site.siteId) ?? 0) > 0,
                );
                const completenessPercentage =
                    sitesInLocation.length > 0
                        ? Math.round(
                              (coveredSites.length / sitesInLocation.length) *
                                  100,
                          )
                        : 0;

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
                        {isExpanded && (
                            <CollapsibleContent>
                                <div className="border-border/60 ml-4.5 border-l pl-4">
                                    <SiteHierarchy
                                        sites={sitesInLocation}
                                        depth={depth + 1}
                                        parentPath={currentPath}
                                        siteIdToSessionCounts={
                                            siteIdToSessionCounts
                                        }
                                        expandedSitePaths={expandedSitePaths}
                                        onToggle={onToggle}
                                        hierarchyLevels={hierarchyLevels}
                                    />
                                </div>
                            </CollapsibleContent>
                        )}
                    </Collapsible>
                );
            })}
        </div>
    );
}
