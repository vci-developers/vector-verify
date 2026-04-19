'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';
import { getLocationTypeName } from '@/lib/location/site-tree';
import { useMemo } from 'react';
import SiteLeafRows from './operations-site-leaf-rows';
import CollapsibleLocationGroup from './collapsible-location-group';

const LEGACY_HIERARCHY_LEVELS = [
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
    sessionCountsBySiteId: Map<
        number,
        { sessionCount: number; needsReviewCount: number }
    >;
    expandedSitePaths: Set<string>;
    onToggle: (path: string) => void;
}

function LegacySiteHierarchy({
    sites,
    depth,
    parentPath,
    sessionCountsBySiteId,
    expandedSitePaths,
    onToggle,
}: SiteHierarchyProps) {
    const currentLevel = LEGACY_HIERARCHY_LEVELS[depth];
    const isLeafLevel = depth === LEGACY_HIERARCHY_LEVELS.length - 1;

    const sortedLocationGroups = useMemo(() => {
        if (!currentLevel) return [];
        const sitesByLocationName: Record<string, Site[]> = {};
        for (const site of sites) {
            const locationName = site[currentLevel.key] ?? 'Unknown';
            (sitesByLocationName[locationName] ??= []).push(site);
        }
        return Object.entries(sitesByLocationName).sort(([a], [b]) =>
            a.localeCompare(b),
        );
    }, [sites, currentLevel]);

    if (!currentLevel) return null;

    if (isLeafLevel) {
        return (
            <SiteLeafRows
                sites={sites}
                getDisplayName={site => site[currentLevel.key] ?? 'Unknown'}
                sessionCountsBySiteId={sessionCountsBySiteId}
            />
        );
    }

    return (
        <div className="space-y-1">
            {sortedLocationGroups.map(([locationName, sitesInGroup]) => (
                <CollapsibleLocationGroup
                    key={`${parentPath}/${locationName}`}
                    locationName={locationName}
                    locationTypeName={currentLevel.label}
                    sitesInGroup={sitesInGroup}
                    parentPath={parentPath}
                    sessionCountsBySiteId={sessionCountsBySiteId}
                    expandedSitePaths={expandedSitePaths}
                    onToggle={onToggle}
                >
                    <LegacySiteHierarchy
                        sites={sitesInGroup}
                        depth={depth + 1}
                        parentPath={`${parentPath}/${locationName}`}
                        sessionCountsBySiteId={sessionCountsBySiteId}
                        expandedSitePaths={expandedSitePaths}
                        onToggle={onToggle}
                    />
                </CollapsibleLocationGroup>
            ))}
        </div>
    );
}

function HierarchicalSiteHierarchy({
    sites,
    depth,
    parentPath,
    sessionCountsBySiteId,
    expandedSitePaths,
    onToggle,
}: SiteHierarchyProps) {
    const allSiteIds = useMemo(
        () => new Set(sites.map(site => site.siteId)),
        [sites],
    );

    const sitesAtCurrentLevel = useMemo(
        () =>
            depth === 0
                ? sites
                      .filter(
                          site =>
                              site.parentId === undefined ||
                              !allSiteIds.has(site.parentId),
                      )
                      .sort((a, b) =>
                          (a.name ?? '').localeCompare(b.name ?? ''),
                      )
                : [...sites].sort((a, b) =>
                      (a.name ?? '').localeCompare(b.name ?? ''),
                  ),
        [sites, depth, allSiteIds],
    );

    const childSitesByParentId = useMemo(() => {
        const map = new Map<number, Site[]>();
        for (const site of sites) {
            if (site.parentId !== undefined && allSiteIds.has(site.parentId)) {
                const siblings = map.get(site.parentId) ?? [];
                siblings.push(site);
                map.set(site.parentId, siblings);
            }
        }
        return map;
    }, [sites, allSiteIds]);

    const isLeafLevel = sitesAtCurrentLevel.every(
        site => !childSitesByParentId.has(site.siteId),
    );

    if (isLeafLevel) {
        return (
            <SiteLeafRows
                sites={sitesAtCurrentLevel}
                getDisplayName={site => site.name ?? 'Unknown'}
                sessionCountsBySiteId={sessionCountsBySiteId}
            />
        );
    }

    const locationTypeName =
        sitesAtCurrentLevel.length > 0
            ? getLocationTypeName(sitesAtCurrentLevel[0]!)
            : 'Location';

    return (
        <div className="space-y-1">
            {sitesAtCurrentLevel.map(site => {
                const childSites = childSitesByParentId.get(site.siteId) ?? [];
                return (
                    <CollapsibleLocationGroup
                        key={`${parentPath}/${site.name}`}
                        locationName={site.name ?? 'Unknown'}
                        locationTypeName={locationTypeName}
                        sitesInGroup={childSites}
                        parentPath={parentPath}
                        sessionCountsBySiteId={sessionCountsBySiteId}
                        expandedSitePaths={expandedSitePaths}
                        onToggle={onToggle}
                    >
                        <HierarchicalSiteHierarchy
                            sites={childSites}
                            depth={depth + 1}
                            parentPath={`${parentPath}/${site.name}`}
                            sessionCountsBySiteId={sessionCountsBySiteId}
                            expandedSitePaths={expandedSitePaths}
                            onToggle={onToggle}
                        />
                    </CollapsibleLocationGroup>
                );
            })}
        </div>
    );
}

export default function OperationsSiteHierarchy(props: SiteHierarchyProps) {
    if (props.sites.length === 0) return null;

    return isLegacySite(props.sites[0]!) ? (
        <LegacySiteHierarchy {...props} />
    ) : (
        <HierarchicalSiteHierarchy {...props} />
    );
}
