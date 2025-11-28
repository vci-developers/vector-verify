'use client';

import { useMemo, useState } from 'react';
import { ColumnDef, type Row } from '@tanstack/react-table';
import { AnnotationTasksListLoadingSkeleton } from './loading-skeleton';
import { DateRangeFilter } from '@/shared/components/date-range-filter';
import { PageSizeSelector } from '@/shared/components/page-size-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { DataTable } from '@/ui/data-table';
import { Badge } from '@/ui/badge';
import { TablePagination } from '@/shared/components/table-pagination';
import { useAnnotationTasksQuery } from '@/features/annotation/hooks/use-annotation-tasks';
import { PAGE_SIZES } from '@/shared/entities/pagination';
import { TaskProgressCell } from './task-progress-cell';
import { useTablePagination } from '@/shared/core/hooks/use-table-pagination';
import {
  calculateDateRange,
  type DateRangeOption,
} from '@/shared/core/utils/date-range';
import {
  AnnotationTask,
  AnnotationTaskStatus,
} from '@/features/annotation/types';
import { formatDate } from '@/shared/core/utils/date';
import Link from 'next/link';

function getBadgeVariantForTaskStatus(
  status: AnnotationTaskStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PENDING':
      return 'destructive';
    case 'IN_PROGRESS':
      return 'secondary';
    case 'COMPLETED':
      return 'default';
    default:
      return 'outline';
  }
}

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
    isPagingDisabled,
  } = pagination;

  function handleDateRangeChange(newDateRange: DateRangeOption) {
    setDateRange(newDateRange);
    setPage(1);
  }

  const columns: ColumnDef<AnnotationTask>[] = useMemo(
    () => [
      {
        id: 'title',
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }: { row: Row<AnnotationTask> }) => {
          const task = row.original;
          return (
            <div className="text-center">
              <Link
                href={'/annotate/' + task.id}
                className="text-foreground hover:text-primary inline-block max-w-full truncate hover:underline"
              >
                {task.title || 'Task #' + task.id}
              </Link>
            </div>
          );
        },
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: { row: Row<AnnotationTask> }) => {
          const task = row.original;
          return (
            <div className="text-center">
              <Badge variant={getBadgeVariantForTaskStatus(task.status)}>
                {task.status}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }: { row: Row<AnnotationTask> }) => {
          const task = row.original;
          const { shortMonthYear: createdAt } = formatDate(task.createdAt);
          return (
            <div className="text-muted-foreground text-center">{createdAt}</div>
          );
        },
      },
      {
        id: 'updatedAt',
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }: { row: Row<AnnotationTask> }) => {
          const task = row.original;
          const { fullDateTime: updatedAt } = formatDate(task.updatedAt);
          return (
            <div className="text-muted-foreground text-center">{updatedAt}</div>
          );
        },
      },
      {
        id: 'progress',
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ row }: { row: Row<AnnotationTask> }) => {
          const task = row.original;
          return (
            <div className="text-center">
              <TaskProgressCell task={task} />
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) {
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
              disabled={isFetching}
            />
            <PageSizeSelector
              value={pageSize}
              onValueChange={handleRowsPerPageChange}
              options={PAGE_SIZES}
              disabled={isFetching}
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tasks}
            searchKey="title"
            searchPlaceholder="Search tasks..."
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            pages={pages}
            isPagingDisabled={isPagingDisabled}
            onNavigateToFirstPage={handleNavigateToFirstPage}
            onNavigateToLastPage={handleNavigateToLastPage}
            onNavigateToPage={handleNavigateToPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
