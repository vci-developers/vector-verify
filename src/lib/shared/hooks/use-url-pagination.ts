'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export function useUrlPagination() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = useMemo(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const pageSizeParam = searchParams.get('pageSize');
    return pageSizeParam
      ? Math.max(1, parseInt(pageSizeParam, 10))
      : DEFAULT_PAGE_SIZE;
  }, [searchParams]);

  const updatePage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(newPage));
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl);
    },
    [router, searchParams],
  );

  const updatePageSize = useCallback(
    (newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPageSize === DEFAULT_PAGE_SIZE) {
        params.delete('pageSize');
      } else {
        params.set('pageSize', String(newPageSize));
      }
      // Reset to page 1 when changing page size
      params.delete('page');
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl);
    },
    [router, searchParams],
  );

  return {
    page,
    pageSize,
    updatePage,
    updatePageSize,
  };
}
