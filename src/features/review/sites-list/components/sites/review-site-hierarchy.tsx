'use client';

import type { Site } from '@/api/site/validation/site-schema';
import type { ReviewSiteSessionSummary } from '@/features/review/utils/review-site-session-summary';
import { isLegacySite } from '@/lib/location/location-query';
import {
    getLocationTypeName,
    getSiteAndDescendants,
    getTopLevelSites,
} from '@/lib/location/site-tree';
import ReviewCollapsibleLocationGroup from './review-collapsible-location-group';
import ReviewSiteLeafRows from './review-site-leaf-rows';

const LEGACY_HIERARCHY_LEVELS = [
    { key: 'subCounty', label: 'Subcounty' },
    { key: 'healthCenter', label: 'Health Center' },
    { key: 'parish', label: 'Parish' },
    { key: 'villageName', label: 'Village' },
    { key: 'houseNumber', label: 'House' },
] as const;

interface ReviewSiteHierarchyProps {
    sites: Site[];
    visibleSiteIds?: Set<number>;
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>;
    buildSiteHref?: (siteId: number) => string;
}

export default function ReviewSiteHierarchy({
    sites,
    visibleSiteIds,
    summaryBySiteId,
    buildSiteHref,
}: ReviewSiteHierarchyProps) {
    if (sites.length === 0) return null;

    return isLegacySite(sites[0]!) ? (
        <LegacySiteLevel
            sites={sites}
            visibleSiteIds={visibleSiteIds}
            depth={0}
            summaryBySiteId={summaryBySiteId}
            buildSiteHref={buildSiteHref}
        />
    ) : (
        <HierarchicalSiteLevel
            allSites={sites}
            sitesAtLevel={getTopLevelSites(sites)}
            visibleSiteIds={visibleSiteIds}
            depth={0}
            summaryBySiteId={summaryBySiteId}
            buildSiteHref={buildSiteHref}
        />
    );
}

function LegacySiteLevel({
    sites,
    visibleSiteIds,
    depth,
    summaryBySiteId,
    buildSiteHref,
}: {
    sites: Site[];
    visibleSiteIds?: Set<number>;
    depth: number;
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>;
    buildSiteHref?: (siteId: number) => string;
}) {
    const level = LEGACY_HIERARCHY_LEVELS[depth]!;

    if (depth === LEGACY_HIERARCHY_LEVELS.length - 1) {
        return (
            <ReviewSiteLeafRows
                sites={sites}
                visibleSiteIds={visibleSiteIds}
                getDisplayName={site => site[level.key] ?? 'Unknown'}
                summaryBySiteId={summaryBySiteId}
                buildSiteHref={buildSiteHref}
            />
        );
    }

    const sitesByName: Record<string, Site[]> = {};
    for (const site of sites) {
        const name = site[level.key] ?? 'Unknown';
        (sitesByName[name] ??= []).push(site);
    }
    const groups = Object.entries(sitesByName).sort(([a], [b]) =>
        a.localeCompare(b),
    );

    return (
        <div className="space-y-1">
            {groups.map(([name, groupSites]) => (
                <ReviewCollapsibleLocationGroup
                    key={name}
                    locationName={name}
                    locationTypeName={level.label}
                    siteIds={groupSites.map(site => site.siteId)}
                    sessionSummaryBySiteId={summaryBySiteId}
                    defaultOpen={depth > 0}
                >
                    <LegacySiteLevel
                        sites={groupSites}
                        visibleSiteIds={visibleSiteIds}
                        depth={depth + 1}
                        summaryBySiteId={summaryBySiteId}
                        buildSiteHref={buildSiteHref}
                    />
                </ReviewCollapsibleLocationGroup>
            ))}
        </div>
    );
}

function HierarchicalSiteLevel({
    allSites,
    sitesAtLevel,
    visibleSiteIds,
    depth,
    summaryBySiteId,
    buildSiteHref,
}: {
    allSites: Site[];
    sitesAtLevel: Site[];
    visibleSiteIds?: Set<number>;
    depth: number;
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>;
    buildSiteHref?: (siteId: number) => string;
}) {
    if (sitesAtLevel.length === 0) return null;

    const isLeafLevel = sitesAtLevel.every(
        site => !allSites.some(other => other.parentId === site.siteId),
    );

    if (isLeafLevel) {
        return (
            <ReviewSiteLeafRows
                sites={sitesAtLevel}
                visibleSiteIds={visibleSiteIds}
                getDisplayName={site => site.name ?? 'Unknown'}
                summaryBySiteId={summaryBySiteId}
                buildSiteHref={buildSiteHref}
            />
        );
    }

    const locationTypeName = getLocationTypeName(sitesAtLevel[0]!);

    return (
        <div className="space-y-1">
            {sitesAtLevel.map(site => {
                const childSites = allSites
                    .filter(other => other.parentId === site.siteId)
                    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
                // Sentinel sites under this group = its leaf descendants.
                const sentinelSiteIds = getSiteAndDescendants(
                    allSites,
                    site.siteId,
                )
                    .filter(
                        descendant =>
                            descendant.siteId !== site.siteId &&
                            !allSites.some(
                                other => other.parentId === descendant.siteId,
                            ),
                    )
                    .map(descendant => descendant.siteId);
                return (
                    <ReviewCollapsibleLocationGroup
                        key={site.siteId}
                        locationName={site.name ?? 'Unknown'}
                        locationTypeName={locationTypeName}
                        siteIds={sentinelSiteIds}
                        sessionSummaryBySiteId={summaryBySiteId}
                        defaultOpen={depth > 0}
                    >
                        <HierarchicalSiteLevel
                            allSites={allSites}
                            sitesAtLevel={childSites}
                            visibleSiteIds={visibleSiteIds}
                            depth={depth + 1}
                            summaryBySiteId={summaryBySiteId}
                            buildSiteHref={buildSiteHref}
                        />
                    </ReviewCollapsibleLocationGroup>
                );
            })}
        </div>
    );
}
