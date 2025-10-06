'use client';

import { AnnotationTasksListLoadingSkeleton } from '@/components/annotate/tasks-list/loading-skeleton';
import { DateRangeFilter } from '@/components/annotate/tasks-list/date-range-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationFirst,
  PaginationLast,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAnnotationTasksQuery } from '@/lib/annotate/client';
import { PAGE_SIZES } from '@/lib/shared/constants';
import { usePagination } from '@/lib/shared/hooks/use-pagination';
import {
  useDateRangeValues,
  type DateRangeOption,
} from '@/lib/shared/utils/date-range';
import { useEffect, useState } from 'react';
import { TaskRow } from './task-row';

export function AnnotationTasksListPageClient() {
  // Local state for date range filter
  const [dateRange, setDateRange] = useState<DateRangeOption>('all-time');
  const { createdAfter, createdBefore } = useDateRangeValues(dateRange);

  const pagination = usePagination({});
  const {
    setTotal,
    page,
    setPage,
    pageSize,
    setPageSizeAndReset,
    canPrev,
    canNext,
    totalPages,
    range: pages,
  } = pagination;

  const { data, isLoading, isFetching } = useAnnotationTasksQuery({
    page,
    limit: pageSize,
    createdAfter,
    createdBefore,
  });

  const tasks = data?.items ?? [];
  const totalFromServer = data?.total;

  useEffect(() => {
    // Only update total when we have actual data to prevent pagination resets
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
    // Reset pagination to page 1 when date range changes
    setPage(1);
  }

  function handleNavigateToPreviousPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && canPrev) setPage(page - 1);
  }

  function handleNavigateToNextPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && canNext) setPage(page + 1);
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

  const isEmpty = !isLoading && !isFetching && tasks.length === 0;

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
              {isEmpty ? (
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
