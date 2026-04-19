import type { GetAllSessionsSuccessPayload } from '@/api/session/validation/get-all-sessions-schema';
import type { GetSpecimensCountSuccessPayload } from '@/api/specimen/validation/get-specimens-count-schema';

export interface VillageMarker {
    id: string;
    villageName: string;
    district?: string | null;
    subCounty?: string | null;
    parish?: string | null;
    sessionCount: number;
    totalSpecimens: number;
    anophelesCount: number;
    speciesBreakdown: Array<{ species: string; count: number }>;
    lastCollectionDate?: number;
}

const ANOPHELES_PREFIXES = ['an.', 'anopheles'] as const;

interface VillageData {
    district?: string | null;
    subCounty?: string | null;
    parish?: string | null;
    totalSpecimens: number;
    anophelesCount: number;
    speciesCounts: Record<string, number>;
}

export function aggregateSpecimensByVillage(
    specimensData: GetSpecimensCountSuccessPayload['data'],
): {
    villageData: Map<string, VillageData>;
    siteIdToVillage: Map<number, string>;
} {
    const villageData = new Map<string, VillageData>();
    const siteIdToVillage = new Map<number, string>();

    for (const entry of specimensData) {
        if (!entry.siteInfo) continue;
        const villageName = entry.siteInfo.villageName;
        if (!villageName) continue;

        siteIdToVillage.set(entry.siteInfo.siteId, villageName);

        const anophelesCount = entry.counts
            .filter(specimenCount =>
                ANOPHELES_PREFIXES.some(prefix =>
                    specimenCount.species?.toLowerCase().startsWith(prefix),
                ),
            )
            .reduce((sum, specimenCount) => sum + specimenCount.count, 0);

        const previous = villageData.get(villageName);
        const mergedSpecies: Record<string, number> = {
            ...(previous?.speciesCounts ?? {}),
        };
        for (const specimenCount of entry.counts) {
            if (!specimenCount.species) continue;
            mergedSpecies[specimenCount.species] =
                (mergedSpecies[specimenCount.species] ?? 0) +
                specimenCount.count;
        }

        villageData.set(villageName, {
            district: entry.siteInfo.district,
            subCounty: entry.siteInfo.subCounty,
            parish: entry.siteInfo.parish,
            totalSpecimens:
                (previous?.totalSpecimens ?? 0) + entry.totalSpecimens,
            anophelesCount: (previous?.anophelesCount ?? 0) + anophelesCount,
            speciesCounts: mergedSpecies,
        });
    }

    return { villageData, siteIdToVillage };
}

export function sessionStatsByVillage(
    sessions: GetAllSessionsSuccessPayload['sessions'],
    siteIdToVillage: Map<number, string>,
): Map<string, { sessionCount: number; lastCollectionDate: number }> {
    const stats = new Map<
        string,
        { sessionCount: number; lastCollectionDate: number }
    >();
    for (const session of sessions) {
        const village = siteIdToVillage.get(session.siteId);
        if (!village) continue;
        const previous = stats.get(village) ?? {
            sessionCount: 0,
            lastCollectionDate: 0,
        };
        stats.set(village, {
            sessionCount: previous.sessionCount + 1,
            lastCollectionDate: Math.max(
                previous.lastCollectionDate,
                session.collectionDate,
            ),
        });
    }
    return stats;
}

export function buildVillageMarkers(
    villageData: Map<string, VillageData>,
    sessionStats: Map<
        string,
        { sessionCount: number; lastCollectionDate: number }
    >,
): VillageMarker[] {
    return Array.from(villageData.entries()).map(
        ([villageName, villageInfo]) => {
            const stats = sessionStats.get(villageName);
            const speciesBreakdown = Object.entries(villageInfo.speciesCounts)
                .map(([species, count]) => ({ species, count }))
                .sort((a, b) => b.count - a.count);

            return {
                id: villageName,
                villageName,
                district: villageInfo.district,
                subCounty: villageInfo.subCounty,
                parish: villageInfo.parish,
                sessionCount: stats?.sessionCount ?? 0,
                totalSpecimens: villageInfo.totalSpecimens,
                anophelesCount: villageInfo.anophelesCount,
                speciesBreakdown,
                lastCollectionDate: stats?.lastCollectionDate || undefined,
            };
        },
    );
}
