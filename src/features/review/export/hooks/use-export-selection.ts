import { useState } from 'react';
import {
    isAllSelected,
    totalSelectedCount,
    toggleSites,
    selectAll,
} from '@/features/review/export/utils/export-selection-helpers';

export function useExportSelection(
    certifiedSiteIdsByMonth: Map<string, Set<number>>,
) {
    const [selectedSites, setSelectedSites] = useState<
        Map<string, Set<number>>
    >(new Map());

    const selectedCount = totalSelectedCount(selectedSites);
    const allSelected = isAllSelected(certifiedSiteIdsByMonth, selectedSites);

    function handleToggleSites(
        monthKey: string,
        siteIds: number[],
        select: boolean,
    ) {
        setSelectedSites(prev => toggleSites(monthKey, siteIds, select, prev));
    }

    function handleSelectAll() {
        setSelectedSites(selectAll(certifiedSiteIdsByMonth));
    }

    function handleDeselectAll() {
        setSelectedSites(new Map());
    }

    return {
        selectedSites,
        selectedCount,
        allSelected,
        handleToggleSites,
        handleSelectAll,
        handleDeselectAll,
    };
}
