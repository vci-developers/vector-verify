'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';
import {
    getLocationTypeName,
    getSiteAndDescendants,
} from '@/lib/location/site-tree';
import { useMemo } from 'react';
import CollapsibleLocationGroup from './collapsible-location-group';

const LEGACY_HIERARCHY_LEVELS = [
    { key: 'subCounty', label: 'Subcounty' },
    { key: 'healthCenter', label: 'Health Center' },
    { key: 'parish', label: 'Parish' },
    { key: 'villageName', label: 'Village' },
    { key: 'houseNumber', label: 'House' },
] as const;

function getLegacyDescendantPaths(
    sites: Site[],
    depth: number,
    parentPath: string,
): string[] {
    const currentLevel = LEGACY_HIERARCHY_LEVELS[depth];
    if (!currentLevel || depth >= LEGACY_HIERARCHY_LEVELS.length - 1) return [];

    const paths: string[] = [];
    const groups: Record<string, Site[]> = {};
    for (const site of sites) {
        const name = site[currentLevel.key] ?? 'Unknown';
        (groups[name] ??= []).push(site);
    }
    for (const [name, groupSites] of Object.entries(groups)) {
        const childPath = `${parentPath}/${name}`;
        paths.push(childPath);
        paths.push(
            ...getLegacyDescendantPaths(groupSites, depth + 1, childPath),
        );
    }
    return paths;
}

function getHierarchicalDescendantPaths(
    sites: Site[],
    parentSiteId: number,
    parentPath: string,
): string[] {
    const childSites = sites
        .filter(site => site.parentId === parentSiteId)
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

    const isLeafLevel = childSites.every(
        site => !sites.some(other => other.parentId === site.siteId),
    );
    if (isLeafLevel || childSites.length === 0) return [];

    const paths: string[] = [];
    for (const site of childSites) {
        const childPath = `${parentPath}/${site.name}`;
        paths.push(childPath);
        paths.push(
            ...getHierarchicalDescendantPaths(sites, site.siteId, childPath),
        );
    }
    return paths;
}

type GroupContent = {
    summaryContent: React.ReactNode;
    prefixContent?: React.ReactNode;
    headerClassName?: string;
} | null;

interface SiteHierarchyRenderProps {
    renderLeafRows: (
        sites: Site[],
        getDisplayName: (site: Site) => string,
    ) => React.ReactNode;
    renderGroupContent: (sitesInGroup: Site[]) => GroupContent;
}

interface LegacySiteHierarchyProps extends SiteHierarchyRenderProps {
    sites: Site[];
    depth: number;
    parentPath: string;
    expandedSitePaths: Set<string>;
    onTogglePath: (path: string, descendantPaths: string[]) => void;
}

function LegacySiteHierarchy({
    sites,
    depth,
    parentPath,
    expandedSitePaths,
    onTogglePath,
    renderLeafRows,
    renderGroupContent,
}: LegacySiteHierarchyProps) {
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
        return renderLeafRows(
            sites,
            site => site[currentLevel.key] ?? 'Unknown',
        );
    }

    return (
        <div className="space-y-1">
            {sortedLocationGroups.map(([locationName, sitesInGroup]) => {
                const path = `${parentPath}/${locationName}`;
                const groupContent = renderGroupContent(sitesInGroup);
                if (!groupContent) return null;
                return (
                    <CollapsibleLocationGroup
                        key={path}
                        locationName={locationName}
                        locationTypeName={currentLevel.label}
                        isExpanded={expandedSitePaths.has(path)}
                        onToggle={() => {
                            const isExpanding = !expandedSitePaths.has(path);
                            const descendantPaths = isExpanding
                                ? getLegacyDescendantPaths(
                                      sitesInGroup,
                                      depth + 1,
                                      path,
                                  )
                                : [];
                            onTogglePath(path, descendantPaths);
                        }}
                        summaryContent={groupContent.summaryContent}
                        prefixContent={groupContent.prefixContent}
                        headerClassName={groupContent.headerClassName}
                    >
                        <LegacySiteHierarchy
                            sites={sitesInGroup}
                            depth={depth + 1}
                            parentPath={path}
                            expandedSitePaths={expandedSitePaths}
                            onTogglePath={onTogglePath}
                            renderLeafRows={renderLeafRows}
                            renderGroupContent={renderGroupContent}
                        />
                    </CollapsibleLocationGroup>
                );
            })}
        </div>
    );
}

interface HierarchicalSiteHierarchyProps extends SiteHierarchyRenderProps {
    sites: Site[];
    parentSiteId: number | undefined;
    parentPath: string;
    expandedSitePaths: Set<string>;
    onTogglePath: (path: string, descendantPaths: string[]) => void;
}

function HierarchicalSiteHierarchy({
    sites,
    parentSiteId,
    parentPath,
    expandedSitePaths,
    onTogglePath,
    renderLeafRows,
    renderGroupContent,
}: HierarchicalSiteHierarchyProps) {
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
        return renderLeafRows(childSites, site => site.name ?? 'Unknown');
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

                const groupContent = renderGroupContent(descendantSites);
                if (!groupContent) return null;

                return (
                    <CollapsibleLocationGroup
                        key={path}
                        locationName={site.name ?? 'Unknown'}
                        locationTypeName={locationTypeName}
                        isExpanded={expandedSitePaths.has(path)}
                        onToggle={() => {
                            const isExpanding = !expandedSitePaths.has(path);
                            const descendantPaths = isExpanding
                                ? getHierarchicalDescendantPaths(
                                      sites,
                                      site.siteId,
                                      path,
                                  )
                                : [];
                            onTogglePath(path, descendantPaths);
                        }}
                        summaryContent={groupContent.summaryContent}
                        prefixContent={groupContent.prefixContent}
                        headerClassName={groupContent.headerClassName}
                    >
                        <HierarchicalSiteHierarchy
                            sites={sites}
                            parentSiteId={site.siteId}
                            parentPath={path}
                            expandedSitePaths={expandedSitePaths}
                            onTogglePath={onTogglePath}
                            renderLeafRows={renderLeafRows}
                            renderGroupContent={renderGroupContent}
                        />
                    </CollapsibleLocationGroup>
                );
            })}
        </div>
    );
}

export interface SiteHierarchyProps extends SiteHierarchyRenderProps {
    sites: Site[];
    parentPath: string;
    expandedSitePaths: Set<string>;
    onTogglePath: (path: string, descendantPaths: string[]) => void;
}

export default function SiteHierarchy({
    sites,
    parentPath,
    expandedSitePaths,
    onTogglePath,
    renderLeafRows,
    renderGroupContent,
}: SiteHierarchyProps) {
    if (sites.length === 0) return null;

    return isLegacySite(sites[0]!) ? (
        <LegacySiteHierarchy
            sites={sites}
            depth={0}
            parentPath={parentPath}
            expandedSitePaths={expandedSitePaths}
            onTogglePath={onTogglePath}
            renderLeafRows={renderLeafRows}
            renderGroupContent={renderGroupContent}
        />
    ) : (
        <HierarchicalSiteHierarchy
            sites={sites}
            parentSiteId={undefined}
            parentPath={parentPath}
            expandedSitePaths={expandedSitePaths}
            onTogglePath={onTogglePath}
            renderLeafRows={renderLeafRows}
            renderGroupContent={renderGroupContent}
        />
    );
}
