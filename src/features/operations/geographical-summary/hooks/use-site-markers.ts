'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetSpecimensCount } from '@/api/specimen/hooks/use-get-specimens-count';
import { useMemo } from 'react';
import { buildSiteMarkers } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import type { LocationQueryParam } from '@/lib/location/location-query';
import type { Site } from '@/api/site/validation/site-schema';

interface UseSiteMarkersParams {
    locationQueryParam: LocationQueryParam;
    descendantsOfSelectedLocation: Site[];
    startDate: string;
    endDate: string;
}

export function useSiteMarkers({
    locationQueryParam,
    descendantsOfSelectedLocation,
    startDate,
    endDate,
}: UseSiteMarkersParams) {
    const locationFilter =
        'district' in locationQueryParam
            ? { district: locationQueryParam.district }
            : { siteId: locationQueryParam.siteId };

    const {
        data: getAllSessionsResult,
        isPending: isGetAllSessionsPending,
        refetch: refetchSessions,
    } = useGetAllSessions({
        startDate,
        endDate,
        type: 'SURVEILLANCE',
        ...locationFilter,
    });

    const {
        data: getSpecimensCountResult,
        isPending: isGetSpecimensCountPending,
        refetch: refetchSpecimensCount,
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
            descendantsOfSelectedLocation,
        );
    }, [
        getAllSessionsResult,
        getSpecimensCountResult,
        descendantsOfSelectedLocation,
    ]);

    return {
        markers,
        totalSites: markers.length,
        isPending,
        isError:
            !isPending &&
            (!getAllSessionsResult?.ok || !getSpecimensCountResult?.ok),
        refetch: () => {
            refetchSessions();
            refetchSpecimensCount();
        },
    };
}
