'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetCollectionCycles } from '@/api/collection-cycle/hooks/use-get-collection-cycles';
import type { Site } from '@/api/site/validation/site-schema';
import { useMemo } from 'react';
import { parseISO } from 'date-fns';
import {
    buildReportingSegments,
    getCollectionCyclesDateRange,
} from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';
import { buildReportingLocations } from '@/features/operations/field-user-compliance/utils/site-reporting-helpers';

export function useSiteReportingGrid({
    programId,
    sites,
    startDate,
    endDate,
}: {
    programId: number;
    sites: Site[];
    startDate: string;
    endDate: string;
}) {
    const {
        data: getCollectionCyclesResult,
        isPending: isGetCollectionCyclesPending,
    } = useGetCollectionCycles(programId, { startDate, endDate });

    const sessionsDateRange = getCollectionCyclesResult?.ok
        ? (getCollectionCyclesDateRange(
              getCollectionCyclesResult.data.collectionCycles,
          ) ?? { startDate, endDate })
        : null;

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions(
            {
                startDate: sessionsDateRange?.startDate ?? '',
                endDate: sessionsDateRange?.endDate ?? '',
                type: 'SURVEILLANCE',
                siteIds: sites.map(site => site.siteId),
            },
            { enabled: sessionsDateRange !== null },
        );

    const locations = buildReportingLocations(sites);

    const segments = useMemo(() => {
        if (!getAllSessionsResult?.ok || !getCollectionCyclesResult?.ok) {
            return null;
        }
        return buildReportingSegments({
            sessions: getAllSessionsResult.data.sessions,
            collectionCycles: getCollectionCyclesResult.data.collectionCycles,
            startMonth: parseISO(startDate),
            endMonth: parseISO(endDate),
        });
    }, [getAllSessionsResult, getCollectionCyclesResult, startDate, endDate]);

    const isError =
        (!isGetCollectionCyclesPending && !getCollectionCyclesResult?.ok) ||
        (sessionsDateRange !== null &&
            !isGetAllSessionsPending &&
            !getAllSessionsResult?.ok);

    return {
        locations,
        segments,
        isPending: !isError && segments === null,
        isError,
    };
}
