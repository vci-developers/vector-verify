'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, MapPin } from 'lucide-react';

// TODO: REMOVE THIS ONCE MIGRATION TO NEW SITE HIERARCHY STRUCTURE IS COMPLETE
const HIERARCHY_LEVELS = [
    { key: 'subCounty', label: 'Subcounty' },
    { key: 'healthCenter', label: 'Health Center' },
    { key: 'parish', label: 'Parish' },
    { key: 'villageName', label: 'Village' },
    { key: 'houseNumber', label: 'House' },
] as const;

interface OperationsSiteHierarchyProps {
    sites: Site[];
    depth: number;
    parentPath: string;
    siteIdToSessionCounts: Map<number, number>;
    expandedSitePaths: Set<string>;
    onToggle: (path: string) => void;
}

export default function OperationsSiteHierarchy({
    sites,
    depth,
    parentPath,
    siteIdToSessionCounts,
    expandedSitePaths,
    onToggle,
}: OperationsSiteHierarchyProps) {
    const currentLevel = HIERARCHY_LEVELS[depth];
    if (!currentLevel) return null;

    const isLeafLevel = depth === HIERARCHY_LEVELS.length - 1;

    if (isLeafLevel) {
        return (
            <div className="space-y-1">
                {sites.map(site => {
                    const sessionCount =
                        siteIdToSessionCounts.get(site.siteId) ?? 0;
                    const hasSessions = sessionCount > 0;

                    return (
                        <div
                            key={site.siteId}
                            className="group hover:bg-muted/50 flex items-center justify-between rounded-md px-3 py-2 transition-colors"
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
                            <Badge
                                variant={hasSessions ? 'default' : 'outline'}
                            >
                                {hasSessions
                                    ? `${sessionCount} session${sessionCount !== 1 ? 's' : ''}`
                                    : 'No sessions'}
                            </Badge>
                        </div>
                    );
                })}
            </div>
        );
    }

    const sitesByLocationName = sites.reduce<Record<string, Site[]>>(
        (groups, site) => {
            const locationName = site[currentLevel.key] ?? 'Unknown';
            groups[locationName] ??= [];
            groups[locationName].push(site);
            return groups;
        },
        {},
    );

    const sortedLocationEntries = Object.entries(sitesByLocationName).sort(
        ([a], [b]) => a.localeCompare(b),
    );

    return (
        <div className="space-y-1">
            {sortedLocationEntries.map(([locationName, sitesInLocation]) => {
                const currentPath = `${parentPath}/${locationName}`;
                const isExpanded = expandedSitePaths.has(currentPath);
                const coveredSites = sitesInLocation.filter(
                    site => (siteIdToSessionCounts.get(site.siteId) ?? 0) > 0,
                );

                return (
                    <Collapsible
                        key={currentPath}
                        open={isExpanded}
                        onOpenChange={() => onToggle(currentPath)}
                    >
                        <CollapsibleTrigger className="w-full">
                            <div
                                className={`group flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-all ${
                                    isExpanded
                                        ? 'bg-primary/10'
                                        : 'hover:bg-primary/10'
                                }`}
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
                                    <Progress
                                        value={
                                            (coveredSites.length /
                                                sitesInLocation.length) *
                                            100
                                        }
                                        className="w-16"
                                    />
                                    <span className="text-muted-foreground text-xs tabular-nums">
                                        {coveredSites.length} of{' '}
                                        {sitesInLocation.length} visited
                                    </span>
                                </div>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="border-border/60 ml-4.5 border-l pl-4">
                                <OperationsSiteHierarchy
                                    sites={sitesInLocation}
                                    depth={depth + 1}
                                    parentPath={currentPath}
                                    siteIdToSessionCounts={
                                        siteIdToSessionCounts
                                    }
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
