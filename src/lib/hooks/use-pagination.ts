import { useCallback, useState } from 'react';

function clamp(currentPage: number, firstPage: number, lastPage: number) {
    return Math.min(Math.max(currentPage, firstPage), lastPage);
}

interface UsePaginationOptions {
    limit?: number;
}

export function usePagination({ limit = 20 }: UsePaginationOptions = {}) {
    const [page, setPage] = useState(1);

    const goToPage = useCallback(
        (newPage: number, totalPages: number) => {
            setPage(clamp(newPage, 1, totalPages));
        },
        [setPage],
    );

    const nextPage = useCallback(
        (totalPages: number) => {
            setPage(previousPage => clamp(previousPage + 1, 1, totalPages));
        },
        [setPage],
    );

    const previousPage = useCallback(
        (totalPages: number) => {
            setPage(previousPage => clamp(previousPage - 1, 1, totalPages));
        },
        [setPage],
    );

    const resetPage = useCallback(() => {
        setPage(1);
    }, [setPage]);

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
