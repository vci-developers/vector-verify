'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetSpecimensCount } from '@/api/specimen/hooks/use-get-specimens-count';
import { useMemo } from 'react';
import { buildSiteMarkers } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import { useCountry } from '@/features/operations/geographical-summary/context/country-context';
import type { Site } from '@/api/site/validation/site-schema';

interface UseSiteMarkersParams {
    siteIds: number[];
    descendantsOfSelectedLocations: Site[];
    startDate: string;
    endDate: string;
}

export function useSiteMarkers({
    siteIds,
    descendantsOfSelectedLocations,
    startDate,
    endDate,
}: UseSiteMarkersParams) {
    const country = useCountry();

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            startDate,
            endDate,
            type: 'SURVEILLANCE',
            siteIds,
        });

    const {
        data: getSpecimensCountResult,
        isPending: isGetSpecimensCountPending,
    } = useGetSpecimensCount({
        startDate,
        endDate,
        sessionType: 'SURVEILLANCE',
        siteIds,
    });

    const isPending = isGetAllSessionsPending || isGetSpecimensCountPending;

    const markers = useMemo(() => {
        if (!getSpecimensCountResult?.ok || !getAllSessionsResult?.ok)
            return [];

        return buildSiteMarkers(
            getSpecimensCountResult.data.data,
            getAllSessionsResult.data.sessions,
            descendantsOfSelectedLocations,
            country,
        );
    }, [
        getAllSessionsResult,
        getSpecimensCountResult,
        descendantsOfSelectedLocations,
        country,
    ]);

    return {
        markers,
        totalSites: markers.length,
        isPending,
        isError:
            !isPending &&
            (!getAllSessionsResult?.ok || !getSpecimensCountResult?.ok),
    };
}
