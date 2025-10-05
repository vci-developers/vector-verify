import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

interface UsePaginationOptions {
  initialTotal?: number;
  initialPage?: number;
  initialPageSize?: number;
  siblingCount?: number;
}

export function usePagination({
  initialTotal = 0,
  initialPage = 1,
  initialPageSize = DEFAULT_PAGE_SIZE,
  siblingCount = 1,
}: UsePaginationOptions) {
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  );

  useEffect(() => {
    // Only adjust page if it exceeds totalPages, don't reset unnecessarily
    setPage(prev => {
      const validPage = Math.min(Math.max(1, prev), totalPages);
      // Only update if the page actually needs to change
      return prev !== validPage ? validPage : prev;
    });
  }, [totalPages]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function slice<T>(items: T[]): T[] {
    return items.slice(start, end);
  }

  function setPageSizeAndReset(size: number) {
    setPageSize(size);
    setPage(1);
  }

  type RangeItem = number | 'ellipsis';
  const range = useMemo<RangeItem[]>(() => {
    const pages: RangeItem[] = [];

    // Always show current page and its 2 neighbors (current-1, current, current+1)
    const startPage = Math.max(1, page - 1);
    const endPage = Math.min(totalPages, page + 1);

    // Add the page numbers
    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
      pages.push(pageNumber);
    }

    // Add ellipsis on the right if there are more pages after the neighbors
    if (endPage < totalPages) {
      pages.push('ellipsis');
    }

    return pages;
  }, [page, totalPages]);

  return {
    total,
    setTotal,
    page,
    setPage,
    pageSize,
    setPageSize,
    setPageSizeAndReset,
    totalPages,
    canPrev,
    canNext,
    start,
    end,
    slice,
    range,
  } as const;
}
