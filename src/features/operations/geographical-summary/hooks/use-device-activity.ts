'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetCollectionCycles } from '@/api/collection-cycle/hooks/use-get-collection-cycles';
import { useMemo } from 'react';
import {
    buildDeviceActivity,
    buildMonthWindow,
    resolveDeviceActivityWindow,
} from '@/features/operations/geographical-summary/utils/device-activity-helpers';

const CYCLE_LOOKBACK_MONTHS = 12;

export function useDeviceActivity(programId: number, siteIds: number[]) {
    const cycleLookbackWindow = useMemo(
        () => buildMonthWindow(Date.now(), CYCLE_LOOKBACK_MONTHS),
        [],
    );

    const {
        data: getCollectionCyclesResult,
        isPending: isGetCollectionCyclesPending,
    } = useGetCollectionCycles(programId, cycleLookbackWindow);

    const deviceActivityWindow = useMemo(() => {
        if (isGetCollectionCyclesPending || !getCollectionCyclesResult?.ok) {
            return null;
        }
        return resolveDeviceActivityWindow(
            getCollectionCyclesResult.data.collectionCycles,
            Date.now(),
        );
    }, [isGetCollectionCyclesPending, getCollectionCyclesResult]);

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions(
            {
                startDate: deviceActivityWindow?.startDate ?? '',
                endDate: deviceActivityWindow?.endDate ?? '',
                type: 'SURVEILLANCE',
                siteIds,
            },
            { enabled: deviceActivityWindow !== null },
        );

    const deviceActivity = useMemo(() => {
        if (!getAllSessionsResult?.ok || deviceActivityWindow === null) {
            return null;
        }
        return buildDeviceActivity(
            getAllSessionsResult.data.sessions,
            deviceActivityWindow.currentCycleId,
            Date.now(),
        );
    }, [getAllSessionsResult, deviceActivityWindow]);

    const isError =
        (!isGetCollectionCyclesPending && !getCollectionCyclesResult?.ok) ||
        (deviceActivityWindow !== null &&
            !isGetAllSessionsPending &&
            !getAllSessionsResult?.ok);

    return {
        deviceActivity,
        isPending: !isError && deviceActivity === null,
        isError,
    };
}
