'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';
import {
    getLocationTypeName,
    getSiteAndDescendants,
} from '@/lib/location/site-tree';
import { useMemo } from 'react';
import ExportCollapsibleLocationGroup from './export-collapsible-location-group';
import ExportSiteLeafRows from './export-site-leaf-rows';

// This and review hierachy levels should be turned into a reusable hierarchy level component as to make things more DRY
const LEGACY_HIERARCHY_LEVELS = [
    { key: 'subCounty', label: 'Subcounty' },
    { key: 'healthCenter', label: 'Health Center' },
    { key: 'parish', label: 'Parish' },
    { key: 'villageName', label: 'Village' },
    { key: 'houseNumber', label: 'House' },
] as const;

interface LegacyExportSiteHierarchyProps {
    sites: Site[];
    depth: number;
    parentPath: string;
    expandedSitePaths: Set<string>;
    onTogglePath: (path: string) => void;
}

function LegacyExportSiteHierarchy({
    sites,
    depth,
    parentPath,
    expandedSitePaths,
    onTogglePath,
}: LegacyExportSiteHierarchyProps) {
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
            <ExportSiteLeafRows
                sites={sites}
                getDisplayName={site => site[currentLevel.key] ?? 'Unknown'}
            />
        );
    }

    return (
        <div className="space-y-1">
            {sortedLocationGroups.map(([locationName, sitesInGroup]) => {
                const path = `${parentPath}/${locationName}`;
                return (
                    <ExportCollapsibleLocationGroup
                        key={path}
                        locationName={locationName}
                        locationTypeName={currentLevel.label}
                        sitesInGroup={sitesInGroup}
                        isExpanded={expandedSitePaths.has(path)}
                        onToggle={() => onTogglePath(path)}
                    >
                        <LegacyExportSiteHierarchy
                            sites={sitesInGroup}
                            depth={depth + 1}
                            parentPath={path}
                            expandedSitePaths={expandedSitePaths}
                            onTogglePath={onTogglePath}
                        />
                    </ExportCollapsibleLocationGroup>
                );
            })}
        </div>
    );
}

interface HierarchicalExportSiteHierarchyProps {
    sites: Site[];
    parentSiteId: number | undefined;
    parentPath: string;
    expandedSitePaths: Set<string>;
    onTogglePath: (path: string) => void;
}

function HierarchicalExportSiteHierarchy({
    sites,
    parentSiteId,
    parentPath,
    expandedSitePaths,
    onTogglePath,
}: HierarchicalExportSiteHierarchyProps) {
    const childSites = useMemo(
        () =>
            sites
                .filter(site => site.parentId === parentSiteId)
                .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
        [sites, parentSiteId],
    );

    const isLeafLevel = childSites.every(
        site => !sites.some(otherSite => otherSite.parentId === site.siteId),
    );

    if (childSites.length === 0) return null;

    if (isLeafLevel) {
        return (
            <ExportSiteLeafRows
                sites={childSites}
                getDisplayName={site => site.name ?? 'Unknown'}
            />
        );
    }

    const locationTypeName = getLocationTypeName(childSites[0]!);

    return (
        <div className="space-y-1">
            {childSites.map(site => {
                const path = `${parentPath}/${site.name}`;
                const descendantSites = getSiteAndDescendants(
                    sites,
                    site.siteId,
                ).filter(
                    descendant =>
                        descendant.siteId !== site.siteId &&
                        !sites.some(
                            otherSite =>
                                otherSite.parentId === descendant.siteId,
                        ),
                );

                return (
                    <ExportCollapsibleLocationGroup
                        key={path}
                        locationName={site.name ?? 'Unknown'}
                        locationTypeName={locationTypeName}
                        sitesInGroup={descendantSites}
                        isExpanded={expandedSitePaths.has(path)}
                        onToggle={() => onTogglePath(path)}
                    >
                        <HierarchicalExportSiteHierarchy
                            sites={sites}
                            parentSiteId={site.siteId}
                            parentPath={path}
                            expandedSitePaths={expandedSitePaths}
                            onTogglePath={onTogglePath}
                        />
                    </ExportCollapsibleLocationGroup>
                );
            })}
        </div>
    );
}

interface ExportSiteHierarchyProps {
    sites: Site[];
    depth: number;
    parentPath: string;
    expandedSitePaths: Set<string>;
    onTogglePath: (path: string) => void;
}

export default function ExportSiteHierarchy({
    sites,
    depth,
    parentPath,
    expandedSitePaths,
    onTogglePath,
}: ExportSiteHierarchyProps) {
    if (sites.length === 0) return null;

    return isLegacySite(sites[0]!) ? (
        <LegacyExportSiteHierarchy
            sites={sites}
            depth={depth}
            parentPath={parentPath}
            expandedSitePaths={expandedSitePaths}
            onTogglePath={onTogglePath}
        />
    ) : (
        <HierarchicalExportSiteHierarchy
            sites={sites}
            parentSiteId={undefined}
            parentPath={parentPath}
            expandedSitePaths={expandedSitePaths}
            onTogglePath={onTogglePath}
        />
    );
}
