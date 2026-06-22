'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useMemo } from 'react';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { buildDeviceActivity } from '@/features/operations/geographical-summary/utils/device-activity-helpers';
import type { LocationQueryParam } from '@/lib/location/location-query';

const INACTIVE_MAX_MONTHS = 5;

export function useDeviceActivity(locationQueryParam: LocationQueryParam) {
    const { startDate, endDate } = useMemo(() => {
        const today = new Date();
        return {
            startDate: format(
                startOfMonth(subMonths(today, INACTIVE_MAX_MONTHS)),
                'yyyy-MM-dd',
            ),
            endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        };
    }, []);

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

    const deviceActivity = useMemo(() => {
        if (!getAllSessionsResult?.ok) return null;
        return buildDeviceActivity(getAllSessionsResult.data.sessions);
    }, [getAllSessionsResult]);

    return {
        deviceActivity,
        isPending: isGetAllSessionsPending,
        isError: !isGetAllSessionsPending && !getAllSessionsResult?.ok,
    };
}
