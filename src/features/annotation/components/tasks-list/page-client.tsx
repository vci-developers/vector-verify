'use client';

import { AnnotationTasksListLoadingSkeleton } from './loading-skeleton';
import { DateRangeFilter } from '@/shared/components/date-range-filter';
import { PageSizeSelector } from '@/shared/components/page-size-selector';
import { TablePagination } from '@/shared/components/table-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import { useAnnotationTasksQuery } from '@/features/annotation/hooks/use-annotation-tasks';
import { PAGE_SIZES } from '@/shared/entities/pagination';
import { useTablePagination } from '@/shared/core/hooks/use-table-pagination';
import {
  calculateDateRange,
  type DateRangeOption,
} from '@/shared/core/utils/date-range';
import { useMemo, useState } from 'react';
import { TaskRow } from './task-row';

export function AnnotationTasksListPageClient() {
  const [dateRange, setDateRange] = useState<DateRangeOption>('all-time');
  const { createdAfter, createdBefore } = useMemo(
    () => calculateDateRange(dateRange),
    [dateRange],
  );

  const { data, isLoading, isFetching } = useAnnotationTasksQuery({
    startDate: createdAfter,
    endDate: createdBefore,
  });

  const tasks = data?.items ?? [];
  const totalFromServer = data?.total;

  const pagination = useTablePagination({
    total: totalFromServer,
    isLoading,
    isFetching,
  });

  const {
    page,
    pageSize,
    totalPages,
    pages,
    handleRowsPerPageChange,
    handleNavigateToFirstPage,
    handleNavigateToLastPage,
    handleNavigateToPage,
    setPage,
  } = pagination;

  // Use actual loading states for pagination
  const actualIsPagingDisabled = Boolean(isLoading || isFetching);

  function handleDateRangeChange(newDateRange: DateRangeOption) {
    setDateRange(newDateRange);
    setPage(1);
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
            <PageSizeSelector
              value={pageSize}
              onValueChange={handleRowsPerPageChange}
              options={PAGE_SIZES}
              disabled={isLoading || isFetching}
            />
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

          <TablePagination
            page={page}
            totalPages={totalPages}
            pages={pages}
            isPagingDisabled={actualIsPagingDisabled}
            onNavigateToFirstPage={handleNavigateToFirstPage}
            onNavigateToLastPage={handleNavigateToLastPage}
            onNavigateToPage={handleNavigateToPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
