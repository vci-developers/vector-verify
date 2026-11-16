import type { Site } from '@/api/site/validation/site-schema';
import {
    getSiteAndDescendants,
    getTopLevelSites,
} from '@/lib/location/site-tree';

export type LocationCheckState = 'checked' | 'indeterminate';

function getAncestorsAndSelfIds(
    siteById: Map<number, Site>,
    siteId: number,
): number[] {
    const ancestorsAndSelfIds = [siteId];
    let parentId = siteById.get(siteId)?.parentId;
    while (parentId != null && siteById.has(parentId)) {
        ancestorsAndSelfIds.push(parentId);
        parentId = siteById.get(parentId)?.parentId;
    }
    return ancestorsAndSelfIds;
}

function getChildIds(accessibleSites: Site[], parentId: number): number[] {
    return accessibleSites
        .filter(site => site.parentId === parentId)
        .map(site => site.siteId);
}

export function toggleLocationInSelection(
    accessibleSites: Site[],
    selectedSiteIds: number[],
    toggledSiteId: number,
): number[] {
    const siteById = new Map(accessibleSites.map(site => [site.siteId, site]));
    const ancestorsAndSelfIds = getAncestorsAndSelfIds(siteById, toggledSiteId);
    const nextSelectedSiteIds = new Set(selectedSiteIds);
    const selectedAncestorIndex = ancestorsAndSelfIds.findIndex(siteId =>
        nextSelectedSiteIds.has(siteId),
    );

    if (selectedAncestorIndex !== -1) {
        const pathFromSelectedAncestor = ancestorsAndSelfIds
            .slice(0, selectedAncestorIndex + 1)
            .reverse();
        nextSelectedSiteIds.delete(pathFromSelectedAncestor[0]!);
        for (
            let index = 0;
            index < pathFromSelectedAncestor.length - 1;
            index++
        ) {
            const nextOnPathId = pathFromSelectedAncestor[index + 1]!;
            for (const childId of getChildIds(
                accessibleSites,
                pathFromSelectedAncestor[index]!,
            )) {
                if (childId !== nextOnPathId) nextSelectedSiteIds.add(childId);
            }
        }
        return [...nextSelectedSiteIds];
    }

    for (const descendant of getSiteAndDescendants(
        accessibleSites,
        toggledSiteId,
    )) {
        nextSelectedSiteIds.delete(descendant.siteId);
    }
    nextSelectedSiteIds.add(toggledSiteId);

    for (const ancestorId of ancestorsAndSelfIds.slice(1)) {
        const siblingIds = getChildIds(accessibleSites, ancestorId);
        if (!siblingIds.every(siteId => nextSelectedSiteIds.has(siteId))) break;
        for (const siteId of siblingIds) nextSelectedSiteIds.delete(siteId);
        nextSelectedSiteIds.add(ancestorId);
    }

    return [...nextSelectedSiteIds];
}

export function getLocationCheckStates(
    accessibleSites: Site[],
    selectedSiteIds: number[],
): Map<number, LocationCheckState> {
    const siteById = new Map(accessibleSites.map(site => [site.siteId, site]));
    const checkStateBySiteId = new Map<number, LocationCheckState>();

    for (const selectedSiteId of selectedSiteIds) {
        for (const ancestorId of getAncestorsAndSelfIds(
            siteById,
            selectedSiteId,
        ).slice(1)) {
            checkStateBySiteId.set(ancestorId, 'indeterminate');
        }
    }
    for (const selectedSiteId of selectedSiteIds) {
        for (const descendant of getSiteAndDescendants(
            accessibleSites,
            selectedSiteId,
        )) {
            checkStateBySiteId.set(descendant.siteId, 'checked');
        }
    }

    return checkStateBySiteId;
}

export interface LocationTreeRow {
    site: Site;
    depth: number;
    hasChildren: boolean;
    searchKeywords: string[];
}

export function buildLocationTreeRows(
    accessibleSites: Site[],
    expandedSiteIds: Set<number> | 'all',
): LocationTreeRow[] {
    const sortedSites = [...accessibleSites].sort((first, second) =>
        (first.name ?? '').localeCompare(second.name ?? ''),
    );
    const rows: LocationTreeRow[] = [];

    function appendRows(
        site: Site,
        depth: number,
        isVisible: boolean,
    ): string[] {
        const childSites = sortedSites.filter(
            childSite => childSite.parentId === site.siteId,
        );
        const row: LocationTreeRow = {
            site,
            depth,
            hasChildren: childSites.length > 0,
            searchKeywords: [site.name ?? ''],
        };
        if (isVisible) rows.push(row);
        const areChildrenVisible =
            isVisible &&
            (expandedSiteIds === 'all' || expandedSiteIds.has(site.siteId));
        for (const childSite of childSites) {
            row.searchKeywords.push(
                ...appendRows(childSite, depth + 1, areChildrenVisible),
            );
        }
        return row.searchKeywords;
    }

    for (const topLevelSite of getTopLevelSites(accessibleSites)) {
        appendRows(topLevelSite, 0, true);
    }
    return rows;
}
