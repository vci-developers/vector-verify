'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetSpecimensCount } from '@/api/specimen/hooks/use-get-specimens-count';
import { useMemo } from 'react';
import {
    aggregateSpecimensByVillage,
    buildVillageMarkers,
    sessionStatsByVillage,
} from '@/features/operations/utils/site-marker-data';

export type { VillageMarker } from '@/features/operations/utils/site-marker-data';

export function useSiteMarkers({
    district,
    startDate,
    endDate,
}: {
    district: string;
    startDate: string;
    endDate: string;
}) {
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
        if (!specimensResult?.ok) return [];

        const { villageData, siteIdToVillage } = aggregateSpecimensByVillage(
            specimensResult.data.data,
        );

        const stats = sessionsResult?.ok
            ? sessionStatsByVillage(
                  sessionsResult.data.sessions,
                  siteIdToVillage,
              )
            : new Map<
                  string,
                  { sessionCount: number; lastCollectionDate: number }
              >();

        return buildVillageMarkers(villageData, stats);
    }, [sessionsResult, specimensResult]);

    return {
        markers,
        totalVillages: markers.filter(marker => marker.sessionCount > 0).length,
        isPending,
        isSpecimensPending,
        sessionsFailed: !isPending && !sessionsResult?.ok,
    };
}
