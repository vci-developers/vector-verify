import type { SiteIrsData } from '@/api/dhis2/validation/post-dhis2-export-schema';
import type { Site } from '@/api/site/validation/site-schema';

export interface ExportBatchItem {
    monthKey: string;
    year: number;
    month: number;
    siteIds: number[];
    district: string;
    irsData: SiteIrsData[];
}

export interface VillageIrsFormData {
    monthKey: string;
    villageName: string;
    wasIrsSprayed: boolean;
    insecticideSprayed: string;
    dateLastSprayed: string;
}

export function buildExportItems(
    selectedSites: Map<string, Set<number>>,
    sites: Site[],
    irsFormData: VillageIrsFormData[],
    district: string,
): ExportBatchItem[] {
    return [...selectedSites.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([monthKey, siteIdSet]) => {
            const [yearStr, monthStr] = monthKey.split('-');
            const siteIds = [...siteIdSet];
            return {
                monthKey,
                year: Number(yearStr),
                month: Number(monthStr),
                siteIds,
                district,
                irsData: buildSiteIrsData(
                    siteIds,
                    sites,
                    irsFormData.filter(e => e.monthKey === monthKey),
                ),
            };
        });
}

function buildSiteIrsData(
    siteIds: number[],
    sites: Site[],
    villageData: VillageIrsFormData[],
): SiteIrsData[] {
    const siteById = new Map(sites.map(site => [site.siteId, site]));
    const byVillage = new Map(
        villageData.map(entry => [entry.villageName, entry]),
    );

    return siteIds.map(siteId => {
        const villageName = siteById.get(siteId)?.villageName ?? '';
        const entry = byVillage.get(villageName);
        if (!entry?.wasIrsSprayed) {
            return { siteId, wasIrsSprayed: false };
        }
        return {
            siteId,
            wasIrsSprayed: true,
            insecticideSprayed: entry.insecticideSprayed || undefined,
            dateLastSprayed: entry.dateLastSprayed || undefined,
        };
    });
}
