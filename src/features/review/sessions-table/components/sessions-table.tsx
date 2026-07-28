'use client';

import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type {
    Session,
    SessionState,
} from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { buildSiteFilter } from '@/lib/location/location-query';
import { getSiteDisplayName } from '@/features/review/sessions-table/utils/get-site-display-name';
import {
    sortSessions,
    type SortColumn,
    type SortState,
} from '@/features/review/sessions-table/utils/sort-sessions';
import { useReassignSessionCycle } from '@/features/review/sessions-table/hooks/use-reassign-session-cycle';
import ReassignmentConfirmDialog from '@/features/review/sessions-table/components/reassignment-confirm-dialog';
import SessionsTableRow from '@/features/review/sessions-table/components/sessions-table-row';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

interface SessionsTableProps {
    programId: number;
    sites: Site[];
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    selectedReviewStates: SessionState[];
    locationQueryParam: LocationQueryParam | undefined;
    startMonth: Date;
    endMonth: Date;
}

function matchesSearch(session: Session, siteName: string, search: string) {
    if (!search) return true;
    const needle = search.toLowerCase();
    return (
        String(session.sessionId).includes(needle) ||
        siteName.toLowerCase().includes(needle)
    );
}

export default function SessionsTable({
    programId,
    sites,
    collectionCycles,
    selectedCycleIds,
    selectedReviewStates,
    locationQueryParam,
    startMonth,
    endMonth,
}: SessionsTableProps) {
    const t = useTranslations('ReviewSessionsTable');
    const [search, setSearch] = useState('');

    const columnLabels: Record<SortColumn, string> = {
        collectionCycle: t('collectionCycle'),
        session: t('session'),
        site: t('site'),
        collectionDate: t('collectionDate'),
        sessionCreated: t('sessionCreated'),
        state: t('state'),
    };

    const siteById = useMemo(
        () => new Map(sites.map(site => [site.siteId, site])),
        [sites],
    );

    const cycleById = useMemo(
        () => new Map(collectionCycles.map(cycle => [cycle.id, cycle])),
        [collectionCycles],
    );

    const startDate = format(startOfMonth(startMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            programId,
            ...(locationQueryParam ? buildSiteFilter(locationQueryParam) : {}),
            startDate,
            endDate,
            ...(selectedCycleIds.length === 1
                ? { collectionCycleId: selectedCycleIds[0] }
                : {}),
        });

    const filteredRows = useMemo(() => {
        if (!getAllSessionsResult?.ok) return [];
        return getAllSessionsResult.data.sessions
            .filter(
                session =>
                    selectedCycleIds.length === 0 ||
                    (session.collectionCycleId !== null &&
                        selectedCycleIds.includes(session.collectionCycleId)),
            )
            .filter(
                session =>
                    selectedReviewStates.length === 0 ||
                    (session.state !== undefined &&
                        selectedReviewStates.includes(session.state)),
            )
            .filter(session => {
                const siteName =
                    getSiteDisplayName(siteById.get(session.siteId)) ?? '';
                return matchesSearch(session, siteName, search);
            });
    }, [
        getAllSessionsResult,
        selectedCycleIds,
        selectedReviewStates,
        siteById,
        search,
    ]);

    const [sort, setSort] = useState<SortState | null>({
        column: 'collectionCycle',
        direction: 'asc',
    });

    const {
        requestReassignment,
        isConfirmDialogOpen,
        cancelReassignment,
        confirmReassignment,
        isReassigning,
    } = useReassignSessionCycle();

    const rows = useMemo(
        () => sortSessions(filteredRows, sort, siteById, cycleById),
        [filteredRows, sort, siteById, cycleById],
    );

    function handleSort(column: SortColumn) {
        setSort(previousSort => {
            if (previousSort?.column !== column) {
                return { column, direction: 'asc' };
            }
            return previousSort.direction === 'asc'
                ? { column, direction: 'desc' }
                : null;
        });
    }

    function renderSortIcon(column: SortColumn) {
        if (sort?.column !== column) {
            return <ArrowUpDown className="size-3.5 opacity-40" />;
        }
        return sort.direction === 'asc' ? (
            <ArrowUp className="size-3.5" />
        ) : (
            <ArrowDown className="size-3.5" />
        );
    }

    const reassignmentDialog = (
        <ReassignmentConfirmDialog
            open={isConfirmDialogOpen}
            onOpenChange={open => {
                if (!open) cancelReassignment();
            }}
            onConfirm={() => void confirmReassignment()}
            isPending={isReassigning}
        />
    );

    const searchInput = (
        <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full"
        />
    );

    if (isGetAllSessionsPending || !getAllSessionsResult) {
        return (
            <div className="flex flex-col space-y-4">
                {searchInput}
                <SkeletonList count={5} height="xl" width="full" />
            </div>
        );
    }

    if (!getAllSessionsResult.ok) {
        return (
            <div className="flex flex-col space-y-4">
                {searchInput}
                <p className="text-destructive text-sm">
                    {getAllSessionsResult.error.message}
                </p>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="flex flex-col space-y-4">
                {searchInput}
                <p className="text-muted-foreground py-12 text-center text-sm">
                    {t('noSessions')}
                </p>
                {reassignmentDialog}
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-4">
            {searchInput}
            <Table
                className="border-border rounded-md border"
                containerClassName="max-h-[calc(100vh-24rem)] overflow-y-auto"
            >
                <TableHeader className="bg-background sticky top-0 z-10">
                    <TableRow>
                        {(
                            Object.entries(columnLabels) as [
                                SortColumn,
                                string,
                            ][]
                        ).map(([column, label]) => (
                            <TableHead key={column}>
                                <button
                                    type="button"
                                    onClick={() => handleSort(column)}
                                    className="flex items-center gap-1"
                                >
                                    {label}
                                    {renderSortIcon(column)}
                                </button>
                            </TableHead>
                        ))}
                        <TableHead>{t('reassignColumnHeader')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(session => {
                        const site = siteById.get(session.siteId);
                        const cycle =
                            session.collectionCycleId !== null
                                ? cycleById.get(session.collectionCycleId)
                                : undefined;

                        return (
                            <SessionsTableRow
                                key={session.sessionId}
                                session={session}
                                site={site}
                                cycle={cycle}
                                collectionCycles={collectionCycles}
                                isReassigning={isReassigning}
                                onReassign={(
                                    reassignedSession,
                                    newCollectionCycleId,
                                ) =>
                                    void requestReassignment(
                                        reassignedSession,
                                        newCollectionCycleId,
                                    )
                                }
                            />
                        );
                    })}
                </TableBody>
            </Table>
            {reassignmentDialog}
        </div>
    );
}
