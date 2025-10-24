'use client';

import { AnnotationTasksListLoadingSkeleton } from './loading-skeleton';
import { DateRangeFilter } from '@/shared/components/date-range-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationFirst,
  PaginationLast,
} from '@/ui/pagination';
import { useAnnotationTasksQuery } from '@/features/annotation/hooks/use-annotation-tasks';
import { PAGE_SIZES } from '@/shared/entities/pagination';
import { usePagination } from '@/shared/core/hooks/use-pagination';
import {
  calculateDateRange,
  type DateRangeOption,
} from '@/shared/core/utils/date-range';
import { useEffect, useMemo, useState } from 'react';
import { TaskRow } from './task-row';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';

export function AnnotationTasksListPageClient() {
  const [dateRange, setDateRange] = useState<DateRangeOption>('all-time');
  const { createdAfter, createdBefore } = useMemo(
    () => calculateDateRange(dateRange),
    [dateRange],
  );

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

  const { data, isLoading, isFetching } = useAnnotationTasksQuery({
    page,
    limit: pageSize,
    startDate: createdAfter,
    endDate: createdBefore,
  });

  const tasks = data?.items ?? [];
  const totalFromServer = data?.total;

  useEffect(() => {
    if (totalFromServer !== undefined) {
      setTotal(totalFromServer);
    }
  }, [totalFromServer, setTotal]);

  const isPagingDisabled = isLoading || isFetching;

  function handleRowsPerPageChange(value: string) {
    setPageSizeAndReset(Number(value));
  }

  function handleDateRangeChange(newDateRange: DateRangeOption) {
    setDateRange(newDateRange);
    setPage(1);
  }

  function handleNavigateToFirstPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && page > 1) setPage(1);
  }

  function handleNavigateToLastPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && page < totalPages) setPage(totalPages);
  }

  function handleNavigateToPage(
    event: React.MouseEvent<HTMLAnchorElement>,
    pageNumber: number,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && pageNumber !== page) setPage(pageNumber);
  }

  if (isLoading || isFetching) {
    return <AnnotationTasksListLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Annotation Tasks</CardTitle>
          <div className="flex items-center gap-4">
            <DateRangeFilter
              value={dateRange}
              onValueChange={handleDateRangeChange}
              disabled={isLoading || isFetching}
            />
            <Select
              value={String(pageSize)}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="text-muted-foreground w-[28%] px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Title
                </TableHead>
                <TableHead className="text-muted-foreground w-[14%] px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground w-[12%] px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Created
                </TableHead>
                <TableHead className="text-muted-foreground w-[20%] px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Updated
                </TableHead>
                <TableHead className="text-muted-foreground w-[26%] px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
                  Progress
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground px-3 py-6 text-center"
                  >
                    No tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map(task => <TaskRow key={task.id} task={task} />)
              )}
            </TableBody>
          </Table>

          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationFirst
                    className={
                      isPagingDisabled || page === 1
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                    onClick={handleNavigateToFirstPage}
                    href="#"
                  />
                </PaginationItem>
                {pages.map((pageItem, index) => (
                  <PaginationItem
                    key={
                      pageItem === 'ellipsis' ? `ellipsis-${index}` : pageItem
                    }
                  >
                    {pageItem === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={pageItem === page}
                        onClick={event => handleNavigateToPage(event, pageItem)}
                      >
                        {pageItem}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationLast
                    className={
                      isPagingDisabled || page === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                    onClick={handleNavigateToLastPage}
                    href="#"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
