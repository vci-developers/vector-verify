'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetCollectionCycles } from '@/api/collection-cycle/hooks/use-get-collection-cycles';
import { useMemo } from 'react';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import {
    buildDeviceActivity,
    resolveDeviceActivityWindow,
} from '@/features/operations/geographical-summary/utils/device-activity-helpers';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import type { Session } from '@/api/session/validation/session-schema';

const CYCLE_LOOKBACK_MONTHS = 12;

export function useDeviceActivity(programId: number, siteIds: number[]) {
    const cycleLookbackWindow = useMemo(() => {
        const currentDate = new Date();
        return {
            startDate: format(
                startOfMonth(subMonths(currentDate, CYCLE_LOOKBACK_MONTHS)),
                'yyyy-MM-dd',
            ),
            endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
        };
    }, []);

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

    const isSessionInCurrentCycle = useMemo(() => {
        if (deviceActivityWindow === null) return () => false;
        const { currentCycleId } = deviceActivityWindow;
        if (currentCycleId !== null) {
            return (session: Session) =>
                session.collectionCycleId === currentCycleId;
        }
        const currentMonthKey = formatDateInTimezone(
            Date.now(),
            'UTC',
            'yyyy-MM',
        );
        return (session: Session) =>
            formatDateInTimezone(session.collectionDate, 'UTC', 'yyyy-MM') ===
            currentMonthKey;
    }, [deviceActivityWindow]);

    const deviceActivity = useMemo(() => {
        if (!getAllSessionsResult?.ok) return null;
        return buildDeviceActivity(
            getAllSessionsResult.data.sessions,
            isSessionInCurrentCycle,
        );
    }, [getAllSessionsResult, isSessionInCurrentCycle]);

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
