'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { GetAllSessionsSuccessPayload } from '@/api/session/validation/get-all-sessions-schema';
import { useGetSpecimensCount } from '@/api/specimen/hooks/use-get-specimens-count';
import type { GetSpecimensCountSuccessPayload } from '@/api/specimen/validation/get-specimens-count-schema';
import { useMemo } from 'react';

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

const MAX_SPECIES_IN_TOOLTIP = 5;
const ANOPHELES_PREFIXES = ['an.', 'anopheles'] as const;

interface VillageData {
    district?: string | null;
    subCounty?: string | null;
    parish?: string | null;
    totalSpecimens: number;
    anophelesCount: number;
    speciesCounts: Record<string, number>;
}

interface SessionStats {
    sessionCount: number;
    lastCollectionDate: number;
}

function aggregateByVillage(data: GetSpecimensCountSuccessPayload['data']): {
    villageData: Map<string, VillageData>;
    siteIdToVillage: Map<number, string>;
} {
    const villageData = new Map<string, VillageData>();
    const siteIdToVillage = new Map<number, string>();

    for (const entry of data) {
        if (!entry.siteInfo) continue;
        const villageName = entry.siteInfo.villageName;
        if (!villageName) continue;

        siteIdToVillage.set(entry.siteInfo.siteId, villageName);

        const anophelesCount = entry.counts
            .filter(c =>
                ANOPHELES_PREFIXES.some(prefix =>
                    c.species?.toLowerCase().startsWith(prefix),
                ),
            )
            .reduce((sum, c) => sum + c.count, 0);

        const prev = villageData.get(villageName);
        const mergedSpecies: Record<string, number> = {
            ...(prev?.speciesCounts ?? {}),
        };
        for (const c of entry.counts) {
            if (!c.species) continue;
            mergedSpecies[c.species] =
                (mergedSpecies[c.species] ?? 0) + c.count;
        }

        villageData.set(villageName, {
            district: entry.siteInfo.district,
            subCounty: entry.siteInfo.subCounty,
            parish: entry.siteInfo.parish,
            totalSpecimens: (prev?.totalSpecimens ?? 0) + entry.totalSpecimens,
            anophelesCount: (prev?.anophelesCount ?? 0) + anophelesCount,
            speciesCounts: mergedSpecies,
        });
    }

    return { villageData, siteIdToVillage };
}

function sessionStatsByVillage(
    sessions: GetAllSessionsSuccessPayload['sessions'],
    siteIdToVillage: Map<number, string>,
): Map<string, SessionStats> {
    const stats = new Map<string, SessionStats>();
    for (const session of sessions) {
        const village = siteIdToVillage.get(session.siteId);
        if (!village) continue;
        const prev = stats.get(village) ?? {
            sessionCount: 0,
            lastCollectionDate: 0,
        };
        stats.set(village, {
            sessionCount: prev.sessionCount + 1,
            lastCollectionDate: Math.max(
                prev.lastCollectionDate,
                session.collectionDate,
            ),
        });
    }
    return stats;
}

function buildMarkers(
    villageData: Map<string, VillageData>,
    sessionStats: Map<string, SessionStats>,
): VillageMarker[] {
    return Array.from(villageData.entries()).map(([villageName, data]) => {
        const stats = sessionStats.get(villageName);
        const speciesBreakdown = Object.entries(data.speciesCounts)
            .map(([species, count]) => ({ species, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, MAX_SPECIES_IN_TOOLTIP);

        return {
            id: villageName,
            villageName,
            district: data.district,
            subCounty: data.subCounty,
            parish: data.parish,
            sessionCount: stats?.sessionCount ?? 0,
            totalSpecimens: data.totalSpecimens,
            anophelesCount: data.anophelesCount,
            speciesBreakdown,
            lastCollectionDate: stats?.lastCollectionDate || undefined,
        };
    });
}

interface SiteMarkersParams {
    district: string;
    startDate: string;
    endDate: string;
}

export interface SiteMarkersResult {
    markers: VillageMarker[];
    totalVillages: number;
    isPending: boolean;
    isSpecimensPending: boolean;
    sessionsFailed: boolean;
}

export function useSiteMarkers({
    district,
    startDate,
    endDate,
}: SiteMarkersParams): SiteMarkersResult {
    const { data: sessionsResult, isPending: isSessionsPending } =
        useGetAllSessions({
            district,
            startDate,
            endDate,
            type: 'SURVEILLANCE',
        });

    const { data: specimensResult, isPending: isSpecimensPending } =
        useGetSpecimensCount({
            district,
            startDate,
            endDate,
            sessionType: 'SURVEILLANCE',
        });

    const isPending = isSessionsPending || isSpecimensPending;

    const markers = useMemo(() => {
        if (!specimensResult?.ok) return [] as VillageMarker[];

        const { villageData, siteIdToVillage } = aggregateByVillage(
            specimensResult.data.data,
        );

        const stats = sessionsResult?.ok
            ? sessionStatsByVillage(
                  sessionsResult.data.sessions,
                  siteIdToVillage,
              )
            : new Map<string, SessionStats>();

        return buildMarkers(villageData, stats);
    }, [sessionsResult, specimensResult]);

    return {
        markers,
        totalVillages: markers.filter(m => m.sessionCount > 0).length,
        isPending,
        isSpecimensPending,
        sessionsFailed: !isPending && !sessionsResult?.ok,
    };
}
