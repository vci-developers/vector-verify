'use client';

import { AnnotationTasksListLoadingSkeleton } from '@/components/annotate/tasks-list/loading-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
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
import { useEffect } from 'react';
import { TaskRow } from './task-row';

export function AnnotationTasksListPageClient() {
  const pagination = usePagination({});
  const {
    setTotal,
    page,
    setPage,
    pageSize,
    setPageSizeAndReset,
    canPrev,
    canNext,
    range: pages,
  } = pagination;

  const { data, isLoading, isFetching } = useAnnotationTasksQuery({
    page,
    limit: pageSize,
  });

  const tasks = data?.items ?? [];
  const totalFromServer = data?.total ?? 0;

  useEffect(() => {
    setTotal(totalFromServer);
  }, [totalFromServer, setTotal]);

  const isPagingDisabled = isLoading || isFetching;

  function handleRowsPerPageChange(value: string) {
    setPageSizeAndReset(Number(value));
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
          <div className="flex items-center gap-2">
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
                  <PaginationPrevious
                    className={
                      isPagingDisabled || !canPrev
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                    onClick={handleNavigateToPreviousPage}
                    href="#"
                  />
                </PaginationItem>
                {pages.map((pageItem) => (
                  <PaginationItem key={pageItem}>
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
                  <PaginationNext
                    className={
                      isPagingDisabled || !canNext
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                    onClick={handleNavigateToNextPage}
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
