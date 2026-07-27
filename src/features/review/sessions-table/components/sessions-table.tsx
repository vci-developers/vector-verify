'use client';

import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type {
    Session,
    SessionState,
} from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import { getSiteDisplayName } from '@/features/review/sessions-table/utils/get-site-display-name';
import {
    sortSessions,
    type SortColumn,
    type SortState,
} from '@/features/review/sessions-table/utils/sort-sessions';
import { useReassignSessionCycle } from '@/features/review/sessions-table/hooks/use-reassign-session-cycle';
import ReassignmentConfirmDialog from '@/features/review/sessions-table/components/reassignment-confirm-dialog';
import { formatCollectionCycleLabel } from '@/features/review/utils/format-collection-cycle-label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Fragment, useMemo, useState } from 'react';

const SESSION_STATE_TRANSLATION_KEY = {
    NEEDS_REVIEW: 'needsReview',
    IN_REVIEW: 'inReview',
    CERTIFIED: 'certified',
    SUBMITTED: 'submitted',
    NOT_APPLICABLE: 'notApplicable',
} as const;

interface SessionsTableProps {
    programId: number;
    sites: Site[];
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    selectedReviewStates: SessionState[];
    selectedLocation: { district: string } | { siteIds: number[] } | null;
    startMonth: Date;
    endMonth: Date;
    search: string;
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
    selectedLocation,
    startMonth,
    endMonth,
    search,
}: SessionsTableProps) {
    const t = useTranslations('ReviewSessionsTable');
    const tSitesList = useTranslations('ReviewSitesList');

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
            ...(selectedLocation ?? {}),
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

    if (isGetAllSessionsPending || !getAllSessionsResult) {
        return <SkeletonList count={5} height="xl" width="full" />;
    }

    if (!getAllSessionsResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getAllSessionsResult.error.message}
            </p>
        );
    }

    if (rows.length === 0) {
        return (
            <Fragment>
                <p className="text-muted-foreground py-12 text-center text-sm">
                    {t('noSessions')}
                </p>
                {reassignmentDialog}
            </Fragment>
        );
    }

    return (
        <Fragment>
            <Table
                className="border-border rounded-md border"
                containerClassName="max-h-[calc(100vh-24rem)] overflow-y-auto"
            >
                <TableHeader className="bg-background sticky top-0 z-10">
                    <TableRow>
                        {(
                            [
                                ['collectionCycle', t('collectionCycle')],
                                ['session', t('session')],
                                ['site', t('site')],
                                ['collectionDate', t('collectionDate')],
                                ['sessionCreated', t('sessionCreated')],
                                ['state', t('state')],
                            ] as [SortColumn, string][]
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
                        const timezone = cycle?.timezone ?? null;
                        const reviewUnitHref =
                            session.collectionCycleId !== null
                                ? `/review/${session.siteId}?collectionCycleId=${session.collectionCycleId}`
                                : `/review/${session.siteId}`;

                        return (
                            <TableRow key={session.sessionId}>
                                <TableCell>
                                    {cycle
                                        ? t('cycleNumber', {
                                              cycleNumber: cycle.cycleNumber,
                                          })
                                        : t('unassigned')}
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={reviewUnitHref}
                                        className="text-primary hover:underline"
                                    >
                                        {session.sessionId}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {getSiteDisplayName(site) ??
                                        t('unknownSite')}
                                </TableCell>
                                <TableCell>
                                    {formatDateInTimezone(
                                        session.collectionDate,
                                        timezone,
                                        'MMM d, yyyy',
                                    )}
                                </TableCell>
                                <TableCell>
                                    {formatDateInTimezone(
                                        session.createdAt,
                                        timezone,
                                        'MMM d, yyyy h:mm a',
                                    )}
                                </TableCell>
                                <TableCell>
                                    {session.state && (
                                        <Badge variant="outline">
                                            {tSitesList(
                                                SESSION_STATE_TRANSLATION_KEY[
                                                    session.state
                                                ],
                                            )}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={
                                            session.collectionCycleId !== null
                                                ? String(
                                                      session.collectionCycleId,
                                                  )
                                                : undefined
                                        }
                                        onValueChange={value =>
                                            void requestReassignment(
                                                session,
                                                Number(value),
                                            )
                                        }
                                        disabled={isReassigning}
                                    >
                                        <SelectTrigger className="w-52">
                                            <SelectValue
                                                placeholder={t('unassigned')}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {collectionCycles.map(
                                                reassignmentCycle => (
                                                    <SelectItem
                                                        key={
                                                            reassignmentCycle.id
                                                        }
                                                        value={String(
                                                            reassignmentCycle.id,
                                                        )}
                                                    >
                                                        {formatCollectionCycleLabel(
                                                            reassignmentCycle,
                                                        )}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            {reassignmentDialog}
        </Fragment>
    );
}
