'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';
import {
    getLocationTypeName,
    getSiteAndDescendants,
} from '@/lib/location/site-tree';
import { useMemo } from 'react';
import ReviewSiteLeafRows from './review-site-leaf-rows';
import ReviewCollapsibleLocationGroup from './review-collapsible-location-group';

const LEGACY_HIERARCHY_LEVELS = [
    { key: 'subCounty', label: 'Subcounty' },
    { key: 'healthCenter', label: 'Health Center' },
    { key: 'parish', label: 'Parish' },
    { key: 'villageName', label: 'Village' },
    { key: 'houseNumber', label: 'House' },
] as const;

interface LegacySiteHierarchyProps {
    sites: Site[];
    depth: number;
    parentPath: string;
    monthKey: string;
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
    monthKey,
    sessionCountsBySiteId,
    expandedSitePaths,
    onToggle,
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
        return (
            <ReviewSiteLeafRows
                sites={sites}
                getDisplayName={site => site[currentLevel.key] ?? 'Unknown'}
                monthKey={monthKey}
                sessionCountsBySiteId={sessionCountsBySiteId}
            />
        );
    }

    return (
        <div className="space-y-1">
            {sortedLocationGroups.map(([locationName, sitesInGroup]) => (
                <ReviewCollapsibleLocationGroup
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
                        monthKey={monthKey}
                        sessionCountsBySiteId={sessionCountsBySiteId}
                        expandedSitePaths={expandedSitePaths}
                        onToggle={onToggle}
                    />
                </ReviewCollapsibleLocationGroup>
            ))}
        </div>
    );
}

interface HierarchicalSiteHierarchyProps {
    sites: Site[];
    parentSiteId: number | undefined;
    parentPath: string;
    monthKey: string;
    sessionCountsBySiteId: Map<
        number,
        { sessionCount: number; needsReviewCount: number }
    >;
    expandedSitePaths: Set<string>;
    onToggle: (path: string) => void;
}

function HierarchicalSiteHierarchy({
    sites,
    parentSiteId,
    parentPath,
    monthKey,
    sessionCountsBySiteId,
    expandedSitePaths,
    onToggle,
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
        return (
            <ReviewSiteLeafRows
                sites={childSites}
                getDisplayName={site => site.name ?? 'Unknown'}
                monthKey={monthKey}
                sessionCountsBySiteId={sessionCountsBySiteId}
            />
        );
    }

    const locationTypeName = getLocationTypeName(childSites[0]!);

    return (
        <div className="space-y-1">
            {childSites.map(site => {
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
                    <ReviewCollapsibleLocationGroup
                        key={`${parentPath}/${site.name}`}
                        locationName={site.name ?? 'Unknown'}
                        locationTypeName={locationTypeName}
                        sitesInGroup={descendantSites}
                        parentPath={parentPath}
                        sessionCountsBySiteId={sessionCountsBySiteId}
                        expandedSitePaths={expandedSitePaths}
                        onToggle={onToggle}
                    >
                        <HierarchicalSiteHierarchy
                            sites={sites}
                            parentSiteId={site.siteId}
                            parentPath={`${parentPath}/${site.name}`}
                            monthKey={monthKey}
                            sessionCountsBySiteId={sessionCountsBySiteId}
                            expandedSitePaths={expandedSitePaths}
                            onToggle={onToggle}
                        />
                    </ReviewCollapsibleLocationGroup>
                );
            })}
        </div>
    );
}

interface ReviewSiteHierarchyProps {
    sites: Site[];
    depth: number;
    parentPath: string;
    monthKey: string;
    sessionCountsBySiteId: Map<
        number,
        { sessionCount: number; needsReviewCount: number }
    >;
    expandedSitePaths: Set<string>;
    onToggle: (path: string) => void;
}

export default function ReviewSiteHierarchy({
    sites,
    depth,
    parentPath,
    monthKey,
    sessionCountsBySiteId,
    expandedSitePaths,
    onToggle,
}: ReviewSiteHierarchyProps) {
    if (sites.length === 0) return null;

    return isLegacySite(sites[0]!) ? (
        <LegacySiteHierarchy
            sites={sites}
            depth={depth}
            parentPath={parentPath}
            monthKey={monthKey}
            sessionCountsBySiteId={sessionCountsBySiteId}
            expandedSitePaths={expandedSitePaths}
            onToggle={onToggle}
        />
    ) : (
        <HierarchicalSiteHierarchy
            sites={sites}
            parentSiteId={undefined}
            parentPath={parentPath}
            monthKey={monthKey}
            sessionCountsBySiteId={sessionCountsBySiteId}
            expandedSitePaths={expandedSitePaths}
            onToggle={onToggle}
        />
    );
}
