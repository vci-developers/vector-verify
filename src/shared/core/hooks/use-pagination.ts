import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/shared/entities/pagination';

interface UsePaginationOptions {
  initialTotal?: number;
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination({
  initialTotal = 0,
  initialPage = 1,
  initialPageSize = DEFAULT_PAGE_SIZE,
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
      // If totalPages is 0 or less, keep current page (might be loading state)
      if (totalPages <= 0) return prev;

      const validPage = Math.min(Math.max(1, prev), totalPages);
      // Only update if the page actually needs to change
      return prev !== validPage ? validPage : prev;
    });
  }, [totalPages]);

  const start = (page - 1) * pageSize;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function setPageSizeAndReset(size: number) {
    setPageSize(size);
    setPage(1);
  }

  type RangeItem = number | 'ellipsis';

  const createRange = useCallback(
    (currentPage: number): RangeItem[] => {
      const pages: RangeItem[] = [];

      // Show first page if not in the neighbor range
      if (currentPage > 2) {
        pages.push(1);
        if (currentPage > 3) {
          pages.push('ellipsis');
        }
      }

      // Show current page and one neighbor on each side
      const startPage = Math.max(1, currentPage - 1);
      const endPage = Math.min(totalPages, currentPage + 1);

      for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
        pages.push(pageNumber);
      }

      // Show last page if not in the neighbor range
      if (currentPage < totalPages - 1) {
        if (currentPage < totalPages - 2) {
          pages.push('ellipsis');
        }
        pages.push(totalPages);
      }

      return pages;
    },
    [totalPages],
  );

  const range = useMemo(() => createRange(page), [createRange, page]);

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
    range,
    createRange,
  } as const;
}
