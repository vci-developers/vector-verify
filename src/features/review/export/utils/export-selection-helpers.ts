export function isMonthFullySelected(
    certifiedSiteIds: Set<number>,
    selectedSiteIds: Set<number> | undefined,
): boolean {
    if (certifiedSiteIds.size === 0) return false;
    if (!selectedSiteIds || selectedSiteIds.size === 0) return false;
    return [...certifiedSiteIds].every(id => selectedSiteIds.has(id));
}

export function totalSelectedCount(
    selectedSites: Map<string, Set<number>>,
): number {
    let total = 0;
    for (const siteIds of selectedSites.values()) total += siteIds.size;
    return total;
}

export function isAllSelected(
    certifiedSiteIdsByMonth: Map<string, Set<number>>,
    selectedSites: Map<string, Set<number>>,
): boolean {
    let totalCertified = 0;
    for (const ids of certifiedSiteIdsByMonth.values())
        totalCertified += ids.size;
    return (
        totalCertified > 0 &&
        totalSelectedCount(selectedSites) === totalCertified
    );
}

export function toggleSites(
    monthKey: string,
    siteIds: number[],
    select: boolean,
    selectedSites: Map<string, Set<number>>,
): Map<string, Set<number>> {
    const next = new Map(selectedSites);
    const monthSet = new Set(next.get(monthKey) ?? []);
    siteIds.forEach(id => {
        if (select) monthSet.add(id);
        else monthSet.delete(id);
    });
    next.set(monthKey, monthSet);
    return next;
}

export function selectAll(
    certifiedSiteIdsByMonth: Map<string, Set<number>>,
): Map<string, Set<number>> {
    const next = new Map<string, Set<number>>();
    for (const [monthKey, certifiedIds] of certifiedSiteIdsByMonth) {
        next.set(monthKey, new Set(certifiedIds));
    }
    return next;
}

export function groupExportResultsByMonth<T>(
    exportResults: Map<string, T>,
): Map<string, Map<number, T>> {
    const map = new Map<string, Map<number, T>>();
    for (const [key, status] of exportResults) {
        const sep = key.indexOf(':');
        const monthKey = key.slice(0, sep);
        const siteId = Number(key.slice(sep + 1));
        const monthMap = map.get(monthKey) ?? new Map<number, T>();
        monthMap.set(siteId, status);
        map.set(monthKey, monthMap);
    }
    return map;
}
