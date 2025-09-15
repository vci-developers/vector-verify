import { useEffect, useMemo, useState } from 'react';

interface UsePaginationOptions {
  total: number;
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination({
  total,
  initialPage = 1,
  initialPageSize = 20,
}: UsePaginationOptions) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  );

  useEffect(() => {
    setPage(prev => Math.min(Math.max(1, prev), totalPages));
  }, [totalPages]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  function slice<T>(items: T[]): T[] {
    return items.slice(start, end);
  }

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    canPrev,
    canNext,
    start,
    end,
    slice,
  } as const;
}

