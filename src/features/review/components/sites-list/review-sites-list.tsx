'use client';

import type { SessionState } from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import { Separator } from '@/components/ui/separator';
import ReviewSiteCard from '@/features/review/components/sites-list/review-site-card';
import { usePagination } from '@/lib/hooks/use-pagination';
import { Fragment, useEffect } from 'react';
import ReviewSitesListPagination from '@/features/review/components/sites-list/review-sites-list-pagination';

interface ReviewSiteListProps {
    sites: Site[];
    startDate: string;
    endDate: string;
    sessionsBySiteId: Map<number, { count: number; state?: SessionState }>;
}

export default function ReviewSitesList({
    sites,
    startDate,
    endDate,
    sessionsBySiteId,
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
    }, [startDate, endDate, resetPage]);

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
                            startDate={startDate}
                            endDate={endDate}
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
