import type { SiteIrsData } from '@/api/dhis2/validation/post-dhis2-uganda-schema';

export interface ExportBatchSite {
    monthKey: string;
    year: number;
    month: number;
    siteId: number;
    district: string;
    irsData: SiteIrsData;
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
): ExportBatchSite[] {
    const sitesToExport: ExportBatchSite[] = [];
    const sortedMonths = [...selectedSites.entries()].sort(([a], [b]) =>
        a.localeCompare(b),
    );
    for (const [monthKey, selectedSiteIds] of sortedMonths) {
        const [yearStr, monthStr] = monthKey.split('-');
        for (const siteId of selectedSiteIds) {
            sitesToExport.push({
                monthKey,
                year: Number(yearStr),
                month: Number(monthStr),
                siteId,
                district,
                irsData: toSiteIrsData(siteId, siteIrsData.get(siteId)),
            });
        }
    }
    return sitesToExport;
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
