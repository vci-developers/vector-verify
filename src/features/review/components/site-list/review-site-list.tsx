'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { SessionState } from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import { Separator } from '@/components/ui/separator';
import ReviewSiteCard from '@/features/review/components/site-list/review-site-card';
import { usePagination } from '@/lib/hooks/use-pagination';
import { ClipboardList } from 'lucide-react';
import { Fragment, useEffect, useMemo } from 'react';
import ReviewSitesListPagination from '@/features/review/components/site-list/review-site-list-pagination';

interface ReviewSiteListProps {
    sites: Site[];
    district: string;
    startDate: string;
    endDate: string;
}

export default function ReviewSiteList({
    sites,
    district,
    startDate,
    endDate,
}: ReviewSiteListProps) {
    const {
        page,
        limit,
        nextPage,
        previousPage,
        goToPage,
        resetPage,
        createPageRange,
    } = usePagination({ limit: 12 });

    useEffect(() => {
        resetPage();
    }, [district, startDate, endDate, resetPage]);

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions(
            { district, startDate, endDate },
            { enabled: !!district },
        );

    const sessionsBySiteId = useMemo(() => {
        const map = new Map<number, { count: number; state?: SessionState }>();
        if (!getAllSessionsResult?.ok) return map;

        for (const { siteId, state } of getAllSessionsResult.data.sessions) {
            const existingSiteId = map.get(siteId);
            map.set(siteId, {
                count: (existingSiteId?.count ?? 0) + 1,
                state: existingSiteId?.state ?? state,
            });
        }
        return map;
    }, [getAllSessionsResult]);

    if (!district) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="text-muted-foreground/50 mb-4 h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                    Select a district to begin reviewing.
                </p>
            </div>
        );
    }

    if (isGetAllSessionsPending || !getAllSessionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getAllSessionsResult.ok) {
        return <h1>ERROR: {getAllSessionsResult.error.message}</h1>;
    }

    if (sites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                    No sites found for this district.
                </p>
            </div>
        );
    }

    const totalPages = Math.ceil(sites.length / limit);
    const paginatedSites = sites.slice((page - 1) * limit, page * limit);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedSites.map(site => {
                    const { count, state } =
                        sessionsBySiteId.get(site.siteId) ?? {};
                    return (
                        <ReviewSiteCard
                            key={site.siteId}
                            site={site}
                            sessionCount={count ?? 0}
                            state={state}
                        />
                    );
                })}
            </div>

            {totalPages > 1 && (
                <Fragment>
                    <Separator />
                    <ReviewSitesListPagination
                        page={page}
                        totalPages={totalPages}
                        pageRange={createPageRange(totalPages)}
                        onPageChange={newPage => goToPage(newPage, totalPages)}
                        onPrevious={() => previousPage(totalPages)}
                        onNext={() => nextPage(totalPages)}
                    />
                </Fragment>
            )}
        </div>
    );
}
