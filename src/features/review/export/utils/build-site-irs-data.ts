import type { SiteIrsData } from '@/api/dhis2/validation/post-dhis2-uganda-schema';

export interface ExportBatchItem {
    monthKey: string;
    year: number;
    month: number;
    siteIds: number[];
    district: string;
    irsData: SiteIrsData[];
}

export interface SiteIrsFormData {
    siteId: number;
    wasIrsSprayed: boolean;
    insecticideSprayed: string;
    dateLastSprayed: string;
}

export function buildExportItems(
    selectedSites: Map<string, Set<number>>,
    siteIrsData: Map<number, SiteIrsFormData>,
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
                irsData: siteIds.map(siteId =>
                    toSiteIrsData(siteId, siteIrsData.get(siteId)),
                ),
            };
        });
}

function toSiteIrsData(
    siteId: number,
    formData: SiteIrsFormData | undefined,
): SiteIrsData {
    if (!formData?.wasIrsSprayed) {
        return { siteId, wasIrsSprayed: false };
    }
    return {
        siteId,
        wasIrsSprayed: true,
        insecticideSprayed: formData.insecticideSprayed || undefined,
        dateLastSprayed: formData.dateLastSprayed || undefined,
    };
}
