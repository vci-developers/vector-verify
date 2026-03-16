import { useState } from 'react';

function clamp(currentPage: number, firstPage: number, lastPage: number) {
    return Math.min(Math.max(currentPage, firstPage), lastPage);
}

export function usePagination() {
    const limit = 20 as const;
    const [page, setPage] = useState(1);

    function goToPage(newPage: number, totalPages: number) {
        setPage(clamp(newPage, 1, totalPages));
    }

    function nextPage(totalPages: number) {
        setPage(previousPage => clamp(previousPage + 1, 1, totalPages));
    }

    function previousPage(totalPages: number) {
        setPage(previousPage => clamp(previousPage - 1, 1, totalPages));
    }

    function resetPage() {
        setPage(1);
    }

    function createPageRange(totalPages: number): (number | 'ellipsis')[] {
        const maxVisiblePages = 5;
        const neighborsCount = 1;
        const firstPage = 1;
        const lastPage = totalPages;

        if (totalPages <= maxVisiblePages)
            return Array.from({ length: totalPages }, (_, index) => index + 1);

        const pages: (number | 'ellipsis')[] = [];

        pages.push(firstPage);

        const neighborhoodStart = Math.max(
            firstPage + 1,
            page - neighborsCount,
        );
        const neighborhoodEnd = Math.min(lastPage - 1, page + neighborsCount);

        if (neighborhoodStart > firstPage + 1) {
            pages.push('ellipsis');
        }
        for (
            let pageNumber = neighborhoodStart;
            pageNumber <= neighborhoodEnd;
            pageNumber++
        ) {
            pages.push(pageNumber);
        }
        if (neighborhoodEnd < lastPage - 1) {
            pages.push('ellipsis');
        }

        pages.push(lastPage);

        return pages;
    }

    return {
        page,
        limit,
        goToPage,
        nextPage,
        previousPage,
        resetPage,
        createPageRange,
    };
}
