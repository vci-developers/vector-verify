'use client';

import React, { useCallback } from 'react';
import { usePagination } from './use-pagination';

interface UseTablePaginationProps {
  total?: number;
  isLoading?: boolean;
  isFetching?: boolean;
}

export function useTablePagination({
  total,
  isLoading,
  isFetching,
}: UseTablePaginationProps) {
  const pagination = usePagination({});
  const {
    setTotal,
    page,
    setPage,
    pageSize,
    setPageSizeAndReset,
    totalPages,
    range: pages,
  } = pagination;

  // Update total when it changes
  React.useEffect(() => {
    if (total !== undefined) {
      setTotal(total);
    }
  }, [total, setTotal]);

  const isPagingDisabled = Boolean(isLoading || isFetching);

  const handleRowsPerPageChange = useCallback(
    (value: string) => {
      setPageSizeAndReset(Number(value));
    },
    [setPageSizeAndReset],
  );

  const handleNavigateToFirstPage = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (!isPagingDisabled && page > 1) setPage(1);
    },
    [isPagingDisabled, page, setPage],
  );

  const handleNavigateToLastPage = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (!isPagingDisabled && page < totalPages) setPage(totalPages);
    },
    [isPagingDisabled, page, totalPages, setPage],
  );

  const handleNavigateToPage = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, pageNumber: number) => {
      event.preventDefault();
      if (!isPagingDisabled && pageNumber !== page) setPage(pageNumber);
    },
    [isPagingDisabled, page, setPage],
  );

  return {
    page,
    pageSize,
    totalPages,
    pages,
    isPagingDisabled,
    handleRowsPerPageChange,
    handleNavigateToFirstPage,
    handleNavigateToLastPage,
    handleNavigateToPage,
    setPage,
    setTotal,
  };
}
