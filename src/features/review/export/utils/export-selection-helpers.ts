export function isMonthFullySelected(
    certifiedSiteIds: Iterable<number>,
    selectedSiteIds: Set<number> | undefined,
): boolean {
    if (!selectedSiteIds || selectedSiteIds.size === 0) return false;
    let hasCertified = false;
    for (const certifiedSiteId of certifiedSiteIds) {
        if (!selectedSiteIds.has(certifiedSiteId)) return false;
        hasCertified = true;
    }
    return hasCertified;
}
