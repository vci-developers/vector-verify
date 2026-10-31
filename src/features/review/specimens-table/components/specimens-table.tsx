'use client';

import { useState } from 'react';
import { useGetSpecimens } from '@/api/specimen/hooks/use-get-specimens';
import type { GetSpecimensQueryParams } from '@/api/specimen/validation/get-specimens-schema';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetAllReviewLogs } from '@/api/session/hooks/use-get-all-review-logs';
import type { ReviewLog } from '@/api/session/validation/get-review-logs-schema';
import type { Site } from '@/api/site/validation/site-schema';
import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import {
    abdomenStatusSchema,
    sexSchema,
    genusSchema,
    anophelesSpeciesSchema,
} from '@/api/specimen-image/validation/specimen-image-schema';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { buildSiteFilter } from '@/lib/location/location-query';
import { Input } from '@/components/ui/input';
import { usePagination } from '@/lib/hooks/use-pagination';
import SpecimensTablePagination from './specimens-table-pagination';
import SpecimenTableFilter from './specimen-table-filter';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { SkeletonList } from '@/components/ui/skeleton-list';
import ErrorBanner from '@/components/ui/error-banner';
import EmptyBanner from '@/components/ui/empty-banner';
import SpecimensTableRow from './specimens-table-row';
import { useSpecimenPredictionLabel } from '../hooks/use-specimen-prediction-label';
import { useTranslations } from 'next-intl';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { getSiteDisplayName } from '@/features/review/sessions-table/utils/get-site-display-name';

const PAGE_SIZE = 20;
const speciesOptions = [
    ...genusSchema.options.filter(genus => genus !== 'Anopheles'),
    ...anophelesSpeciesSchema.options.map(species => `Anopheles ${species}`),
];
interface SpecimensTableProps {
    programId: number;
    sites: Site[];
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    locationQueryParam?: LocationQueryParam;
    startMonth: Date;
    endMonth: Date;
}
export default function SpecimensTable(props: SpecimensTableProps) {
    const scopeKey = JSON.stringify([
        props.programId,
        props.selectedCycleIds,
        props.locationQueryParam,
        props.startMonth,
        props.endMonth,
    ]);
    return <SpecimensTableContent key={scopeKey} {...props} />;
}
function SpecimensTableContent({
    programId,
    sites,
    collectionCycles,
    selectedCycleIds,
    locationQueryParam,
    startMonth,
    endMonth,
}: SpecimensTableProps) {
    const t = useTranslations('ReviewSpecimens');
    const getPredictionLabel = useSpecimenPredictionLabel();
    const [search, setSearch] = useState('');
    const [species, setSpecies] = useState('all');
    const [sex, setSex] = useState('all');
    const [abdomenStatus, setAbdomenStatus] = useState('all');
    const [siteId, setSiteId] = useState('all');
    const { page, resetPage, goToPage, createPageRange } = usePagination({
        limit: PAGE_SIZE,
    });
    const offset = (page - 1) * PAGE_SIZE;
    const [sortOrder, setSortOrder] =
        useState<GetSpecimensQueryParams['sortOrder']>();
    const SortIcon =
        sortOrder === 'asc'
            ? ArrowUp
            : sortOrder === 'desc'
              ? ArrowDown
              : ArrowUpDown;
    const specimenAriaSort =
        sortOrder === 'asc'
            ? 'ascending'
            : sortOrder === 'desc'
              ? 'descending'
              : 'none';

    function toggleSpecimenSort() {
        setSortOrder(previous =>
            previous === undefined
                ? 'asc'
                : previous === 'asc'
                  ? 'desc'
                  : undefined,
        );
        resetPage();
    }
    const startDate = format(startOfMonth(startMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');
    const collectionCycleId = selectedCycleIds[0];
    const selectedSiteId =
        siteId !== 'all'
            ? Number(siteId)
            : locationQueryParam && 'siteId' in locationQueryParam
              ? locationQueryParam.siteId
              : undefined;
    const {
        data: sessionsResult,
        isPending: sessionsPending,
        isError: sessionsError,
    } = useGetAllSessions({
        programId,
        startDate,
        endDate,
        type: 'SURVEILLANCE',
        ...(locationQueryParam ? buildSiteFilter(locationQueryParam) : {}),
        collectionCycleId,
    });
    const {
        data: result,
        isPending,
        isError,
    } = useGetSpecimens({
        programId,
        startDate,
        endDate,
        sessionType: 'SURVEILLANCE',
        ...locationQueryParam,
        siteId: selectedSiteId,
        collectionCycleId,
        specimenId: search || undefined,
        species: species === 'all' ? undefined : species,
        sex: sex === 'all' ? undefined : sex,
        abdomenStatus: abdomenStatus === 'all' ? undefined : abdomenStatus,
        includeAllImages: true,
        sortBy: sortOrder ? 'specimenId' : undefined,
        sortOrder,
        limit: PAGE_SIZE,
        offset,
    });
    const { data: reviewLogsResult, isError: isReviewLogsError } =
        useGetAllReviewLogs(
            {
                siteId: selectedSiteId,
                collectionCycleId,
                action: 'update_specimen_image_prediction',
                hasChanges: 'true',
            },
            {
                enabled:
                    result?.ok === true && result.data.specimens.length > 0,
            },
        );
    const reviewLogsError = isReviewLogsError || reviewLogsResult?.ok === false;
    const reviewLogsBySpecimenId = new Map<number, ReviewLog[]>();
    if (reviewLogsResult?.ok) {
        for (const log of reviewLogsResult.data.logs) {
            const specimenId = log.specimenId ?? log.fields?.specimenId;
            if (typeof specimenId !== 'number') continue;
            const specimenLogs = reviewLogsBySpecimenId.get(specimenId) ?? [];
            specimenLogs.push(log);
            reviewLogsBySpecimenId.set(specimenId, specimenLogs);
        }
    }
    const totalPages = result?.ok
        ? Math.max(1, Math.ceil(result.data.total / PAGE_SIZE))
        : 1;
    const sessions = sessionsResult?.ok ? sessionsResult.data.sessions : [];
    const columns = [
        'cycle',
        'specimen',
        'session',
        'site',
        'species',
        'sex',
        'abdomenStatus',
        'images',
        'changes',
        'review',
    ] as const;
    return (
        <div className="flex flex-col space-y-4">
            <Input
                aria-label={t('search')}
                placeholder={t('search')}
                value={search}
                onChange={event => {
                    setSearch(event.target.value);
                    resetPage();
                }}
                className="w-full"
            />
            <div className="flex flex-wrap gap-2">
                <SpecimenTableFilter
                    field="site"
                    value={siteId}
                    allLabel={t('allSites')}
                    options={sites.map(site => ({
                        value: String(site.siteId),
                        label: getSiteDisplayName(site) ?? String(site.siteId),
                    }))}
                    onValueChange={value => {
                        setSiteId(value);
                        resetPage();
                    }}
                />
                {(
                    [
                        {
                            field: 'species',
                            value: species,
                            set: setSpecies,
                            options: speciesOptions,
                        },
                        {
                            field: 'sex',
                            value: sex,
                            set: setSex,
                            options: sexSchema.options,
                        },
                        {
                            field: 'abdomenStatus',
                            value: abdomenStatus,
                            set: setAbdomenStatus,
                            options: abdomenStatusSchema.options,
                        },
                    ] as const
                ).map(filter => (
                    <SpecimenTableFilter
                        key={filter.field}
                        field={filter.field}
                        value={filter.value}
                        allLabel={t(`allFilters.${filter.field}`)}
                        options={filter.options.map(option => ({
                            value: option,
                            label: getPredictionLabel(filter.field, option),
                        }))}
                        onValueChange={value => {
                            filter.set(value);
                            resetPage();
                        }}
                    />
                ))}
            </div>
            {isError ||
            sessionsError ||
            (result && !result.ok) ||
            (sessionsResult && !sessionsResult.ok) ? (
                <ErrorBanner message={t('error')} />
            ) : isPending || sessionsPending || !result ? (
                <SkeletonList count={5} height="xl" width="full" />
            ) : (
                <>
                    {result.data.specimens.length === 0 ? (
                        <EmptyBanner message={t('empty')} />
                    ) : (
                        <Table
                            className="border-border rounded-md border [&_td]:text-center [&_th]:text-center"
                            containerClassName="max-h-[calc(100vh-24rem)] overflow-y-auto"
                        >
                            <TableHeader className="bg-background sticky top-0 z-10">
                                <TableRow>
                                    {columns.map(column => (
                                        <TableHead
                                            key={column}
                                            aria-sort={
                                                column === 'specimen'
                                                    ? specimenAriaSort
                                                    : undefined
                                            }
                                        >
                                            {column === 'specimen' ? (
                                                <button
                                                    type="button"
                                                    onClick={toggleSpecimenSort}
                                                    className="mx-auto flex items-center gap-1"
                                                >
                                                    {t(column)}
                                                    <SortIcon
                                                        className={
                                                            sortOrder
                                                                ? 'size-3.5'
                                                                : 'size-3.5 opacity-40'
                                                        }
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                            ) : (
                                                t(column)
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.data.specimens.map(specimen => {
                                    const session =
                                        specimen.session ??
                                        sessions.find(
                                            session =>
                                                session.sessionId ===
                                                specimen.sessionId,
                                        );
                                    const cycle = collectionCycles.find(
                                        cycle =>
                                            cycle.id ===
                                            session?.collectionCycleId,
                                    );
                                    return (
                                        <SpecimensTableRow
                                            key={specimen.id}
                                            specimen={specimen}
                                            reviewLogs={
                                                reviewLogsResult?.ok
                                                    ? (reviewLogsBySpecimenId.get(
                                                          specimen.id,
                                                      ) ?? [])
                                                    : undefined
                                            }
                                            reviewLogsError={reviewLogsError}
                                            session={session}
                                            site={sites.find(
                                                site =>
                                                    site.siteId ===
                                                    session?.siteId,
                                            )}
                                            timezone={
                                                cycle?.timezone ?? undefined
                                            }
                                            cycleNumber={cycle?.cycleNumber}
                                            hasCollectionCycles={
                                                collectionCycles.length > 0
                                            }
                                        />
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                    <SpecimensTablePagination
                        total={result.data.total}
                        page={page}
                        totalPages={totalPages}
                        pageRange={createPageRange(totalPages)}
                        onPageChange={nextPage =>
                            goToPage(nextPage, totalPages)
                        }
                    />
                </>
            )}
        </div>
    );
}
