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
      const previous = currentPage - 1;
      if (previous >= 1) {
        pages.push(previous);
      }

      pages.push(currentPage);

      const next = currentPage + 1;
      if (next <= totalPages) {
        pages.push(next);
        if (next < totalPages) {
          pages.push('ellipsis');
        }
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
