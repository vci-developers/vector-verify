'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetSpecimensCount } from '@/api/specimen/hooks/use-get-specimens-count';
import { useMemo } from 'react';
import { buildSiteMarkers } from '@/features/operations/utils/site-marker-data';
import type { LocationQueryParam } from '@/lib/location/location-query';
import type { Site } from '@/api/site/validation/site-schema';

interface UseSiteMarkersParams {
    locationQueryParam: LocationQueryParam;
    sites: Site[];
    startDate: string;
    endDate: string;
}

export function useSiteMarkers({
    locationQueryParam,
    sites,
    startDate,
    endDate,
}: UseSiteMarkersParams) {
    const locationFilter =
        'district' in locationQueryParam
            ? { district: locationQueryParam.district }
            : { siteId: locationQueryParam.siteId };

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            startDate,
            endDate,
            type: 'SURVEILLANCE',
            ...locationFilter,
        });

    const {
        data: getSpecimensCountResult,
        isPending: isGetSpecimensCountPending,
    } = useGetSpecimensCount({
        startDate,
        endDate,
        sessionType: 'SURVEILLANCE',
        ...locationFilter,
    });

    const isPending = isGetAllSessionsPending || isGetSpecimensCountPending;

    const markers = useMemo(() => {
        if (!getSpecimensCountResult?.ok || !getAllSessionsResult?.ok)
            return [];

        return buildSiteMarkers(
            getSpecimensCountResult.data.data,
            getAllSessionsResult.data.sessions,
            sites,
        );
    }, [getAllSessionsResult, getSpecimensCountResult, sites]);

    return {
        markers,
        totalSites: markers.length,
        isPending,
        isError:
            !isPending &&
            (!getAllSessionsResult?.ok || !getSpecimensCountResult?.ok),
    };
}
