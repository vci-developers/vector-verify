'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';
import { useGetCollectionCycles } from '@/api/collection-cycle/hooks/use-get-collection-cycles';
import type { Site } from '@/api/site/validation/site-schema';
import { useMemo } from 'react';
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

    const sessionQueryParams: GetAllSessionsQueryParams =
        collectionCycles && collectionCycles.length > 0
            ? {
                  collectionCycleIds: collectionCycles.map(
                      collectionCycle => collectionCycle.id,
                  ),
                  type: 'SURVEILLANCE',
                  siteIds,
              }
            : { startDate, endDate, type: 'SURVEILLANCE', siteIds };

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions(sessionQueryParams, {
            enabled: collectionCycles !== null,
        });

    const locations = buildReportingLocations(sites);

    const segments = useMemo(() => {
        if (!getAllSessionsResult?.ok || collectionCycles === null) {
            return null;
        }
        return buildReportingSegments({
            sessions: getAllSessionsResult.data.sessions,
            collectionCycles,
            startMonth: parseISO(startDate),
            endMonth: parseISO(endDate),
        });
    }, [getAllSessionsResult, collectionCycles, startDate, endDate]);

    const isError =
        (!isGetCollectionCyclesPending && !getCollectionCyclesResult?.ok) ||
        (collectionCycles !== null &&
            !isGetAllSessionsPending &&
            !getAllSessionsResult?.ok);

    return {
        locations,
        segments,
        isPending: !isError && segments === null,
        isError,
    };
}
