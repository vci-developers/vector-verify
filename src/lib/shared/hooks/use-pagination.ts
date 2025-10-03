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
    const totalPageNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const leftSibling = Math.max(page - siblingCount, 2);
    const rightSibling = Math.min(page + siblingCount, totalPages - 1);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;
    const pages: RangeItem[] = [1];
    if (showLeftEllipsis) pages.push('ellipsis');
    for (let pageNumber = leftSibling; pageNumber <= rightSibling; pageNumber++)
      pages.push(pageNumber);
    if (showRightEllipsis) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  }, [page, siblingCount, totalPages]);

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
