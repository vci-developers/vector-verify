'use client';

import type { Site } from '@/api/site/validation/site-schema';
import type { ReviewSiteSessionSummary } from '@/features/review/utils/review-site-session-summary';
import { isLegacySite } from '@/lib/location/location-query';
import { getLocationTypeName, getTopLevelSites } from '@/lib/location/site-tree';
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
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>;
}

export default function ReviewSiteHierarchy({
    sites,
    summaryBySiteId,
}: ReviewSiteHierarchyProps) {
    if (sites.length === 0) return null;

    return isLegacySite(sites[0]!) ? (
        <LegacySiteLevel
            sites={sites}
            depth={0}
            summaryBySiteId={summaryBySiteId}
        />
    ) : (
        <HierarchicalSiteLevel
            allSites={sites}
            sitesAtLevel={getTopLevelSites(sites)}
            summaryBySiteId={summaryBySiteId}
        />
    );
}

function LegacySiteLevel({
    sites,
    depth,
    summaryBySiteId,
}: {
    sites: Site[];
    depth: number;
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>;
}) {
    const level = LEGACY_HIERARCHY_LEVELS[depth]!;

    if (depth === LEGACY_HIERARCHY_LEVELS.length - 1) {
        return (
            <ReviewSiteLeafRows
                sites={sites}
                getDisplayName={site => site[level.key] ?? 'Unknown'}
                summaryBySiteId={summaryBySiteId}
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
                >
                    <LegacySiteLevel
                        sites={groupSites}
                        depth={depth + 1}
                        summaryBySiteId={summaryBySiteId}
                    />
                </ReviewCollapsibleLocationGroup>
            ))}
        </div>
    );
}

function HierarchicalSiteLevel({
    allSites,
    sitesAtLevel,
    summaryBySiteId,
}: {
    allSites: Site[];
    sitesAtLevel: Site[];
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>;
}) {
    if (sitesAtLevel.length === 0) return null;

    const isLeafLevel = sitesAtLevel.every(
        site => !allSites.some(other => other.parentId === site.siteId),
    );

    if (isLeafLevel) {
        return (
            <ReviewSiteLeafRows
                sites={sitesAtLevel}
                getDisplayName={site => site.name ?? 'Unknown'}
                summaryBySiteId={summaryBySiteId}
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
                return (
                    <ReviewCollapsibleLocationGroup
                        key={site.siteId}
                        locationName={site.name ?? 'Unknown'}
                        locationTypeName={locationTypeName}
                    >
                        <HierarchicalSiteLevel
                            allSites={allSites}
                            sitesAtLevel={childSites}
                            summaryBySiteId={summaryBySiteId}
                        />
                    </ReviewCollapsibleLocationGroup>
                );
            })}
        </div>
    );
}
