'use client';

import {
    useGetAllSessions,
    useGetAllSessionsByCollectionCycleIds,
} from '@/api/session/hooks/use-get-all-sessions';
import { useGetCollectionCycles } from '@/api/collection-cycle/hooks/use-get-collection-cycles';
import type { Site } from '@/api/site/validation/site-schema';
import { parseISO } from 'date-fns';
import { buildReportingSegments } from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';
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

    const collectionCycles = getCollectionCyclesResult?.ok
        ? getCollectionCyclesResult.data.collectionCycles
        : null;
    const siteIds = sites.map(site => site.siteId);

    const sessionQueries = useGetAllSessionsByCollectionCycleIds(
        collectionCycles?.map(cycle => cycle.id) ?? [],
        { type: 'SURVEILLANCE', siteIds },
    );

    const isMonthFallback = collectionCycles?.length === 0;
    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions(
            { startDate, endDate, type: 'SURVEILLANCE', siteIds },
            { enabled: isMonthFallback },
        );

    const sessionsResults = isMonthFallback
        ? [getAllSessionsResult]
        : sessionQueries.map(query => query.data);
    const isSessionsPending = isMonthFallback
        ? isGetAllSessionsPending
        : sessionQueries.some(query => query.isPending);

    const locations = buildReportingLocations(sites);

    const segments =
        collectionCycles !== null && sessionsResults.every(result => result?.ok)
            ? buildReportingSegments({
                  sessions: sessionsResults.flatMap(result =>
                      result?.ok ? result.data.sessions : [],
                  ),
                  collectionCycles,
                  startMonth: parseISO(startDate),
                  endMonth: parseISO(endDate),
              })
            : null;

    const isError =
        (!isGetCollectionCyclesPending && !getCollectionCyclesResult?.ok) ||
        (collectionCycles !== null &&
            !isSessionsPending &&
            !sessionsResults.every(result => result?.ok));

    return {
        locations,
        segments,
        isPending: !isError && segments === null,
        isError,
    };
}
