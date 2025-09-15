'use client';

import { Badge } from '@/components/ui/badge';
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
import { Progress } from '@/components/ui/progress';
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
import { AnnotateLoadingSkeleton } from '@/components/annotate/annotate-loading-skeleton';
import type { AnnotationTaskStatus } from '@/lib/entities/annotation';
import { PAGE_SIZES } from '@/lib/shared/constants';
import { usePagination } from '@/lib/shared/hooks/use-pagination';
import { formatDate } from '@/lib/shared/utils/date';
import Link from 'next/link';
import { useEffect } from 'react';

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

function getTaskProgressPercent(status: AnnotationTaskStatus): number {
  switch (status) {
    case 'PENDING':
      return 10;
    case 'IN_PROGRESS':
      return 60;
    case 'COMPLETED':
      return 100;
    default:
      return 0;
  }
}

export function AnnotatePageClient() {
  const pagination = usePagination({});
  const { setTotal, page, setPage, pageSize, setPageSizeAndReset, canPrev, canNext, range: pages } = pagination;

  const { data, isLoading, isFetching } = useAnnotationTasksQuery({ page, limit: pageSize });

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
    return <AnnotateLoadingSkeleton />;
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
                <TableHead className="w-[28%] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</TableHead>
                <TableHead className="w-[14%] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                <TableHead className="w-[12%] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</TableHead>
                <TableHead className="w-[20%] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Updated</TableHead>
                <TableHead className="w-[26%] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isEmpty ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map(task => {
                  const createdMonthYear = formatDate(
                    task.createdAt,
                  ).shortMonthYear;
                  const updatedFull = formatDate(task.updatedAt).fullDateTime;
                  const progress = getTaskProgressPercent(task.status);
                  return (
                    <TableRow key={task.id} className="hover:bg-accent/30 h-16">
                      <TableCell className="px-4 py-4 align-middle text-center">
                        <Link href={`/annotate/${task.id}`} className="inline-block max-w-full truncate text-foreground hover:text-primary hover:underline">
                          {task.title || `Task #${task.id}`}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-middle text-center">
                        <Badge
                          variant={getBadgeVariantForTaskStatus(task.status)}
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 align-middle text-center text-muted-foreground">
                        {createdMonthYear}
                      </TableCell>
                      <TableCell className="px-4 py-4 align-middle text-center text-muted-foreground">
                        {updatedFull}
                      </TableCell>
                      <TableCell className="px-4 py-4 align-middle text-center">
                        <div className="mx-auto flex max-w-[280px] items-center justify-center gap-3">
                          <div className="flex-1">
                            <Progress className="w-full" value={progress} />
                          </div>
                          <span className="min-w-8 text-center text-xs font-medium text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
                {pages.map((pageItem, index) => (
                  <PaginationItem key={`${pageItem}-${index}`}>
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
