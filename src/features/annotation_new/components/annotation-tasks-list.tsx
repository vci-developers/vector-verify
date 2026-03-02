'use client';

import { useGetAnnotationTasks } from '@/api/annotation-task/hooks/use-get-annotation-tasks';
import type { GetAnnotationTasksQueryParams } from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import {
    annotationTaskStatusSchema,
    type AnnotationTaskStatus,
} from '@/api/annotation-task/validation/annotation-task-schema';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Card } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { usePagination } from '@/lib/hooks/use-pagination';

export default function AnnotationTasksList() {
    const {
        page,
        limit,
        goToPage,
        nextPage,
        previousPage,
        resetPage,
        createPageRange,
    } = usePagination();

    const [range, setRange] = useState<DateRange | undefined>(undefined);
    const [status, setStatus] = useState<AnnotationTaskStatus>('PENDING');

    const startDate = range?.from ? range.from.toISOString() : undefined;
    const endDate = range?.to ? range.to.toISOString() : undefined;

    const queryParams: GetAnnotationTasksQueryParams = {
        status,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        page,
        limit,
    };

    const {
        data: getAnnotationTasksResult,
        isPending: isGetAnnotationTasksPending,
    } = useGetAnnotationTasks(queryParams);

    function handleStatusChange(newStatus: AnnotationTaskStatus) {
        setStatus(newStatus);
        resetPage();
    }

    function handleChangeDateRange(newRange: DateRange | undefined) {
        setRange(newRange);
        resetPage();
    }

    function handleClearDateRange() {
        setRange(undefined);
        resetPage();
    }

    if (isGetAnnotationTasksPending || !getAnnotationTasksResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getAnnotationTasksResult.ok) {
        return <h1>ERROR: {getAnnotationTasksResult.error.message}</h1>;
    }

    const annotationTasks = getAnnotationTasksResult.data.tasks;
    const totalItems = getAnnotationTasksResult.data.total;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return (
        <div className="space-y-4">
            <Tabs
                value={status}
                onValueChange={value =>
                    handleStatusChange(value as AnnotationTaskStatus)
                }
            >
                <TabsList>
                    {annotationTaskStatusSchema.options.map(status => (
                        <TabsTrigger key={status} value={status}>
                            {status.replaceAll('_', ' ')}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <Card className="p-4">
                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">Date</div>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-start"
                                >
                                    {!startDate && !endDate
                                        ? 'Select date range'
                                        : `${startDate ?? '...'} - ${endDate ?? '...'}`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    numberOfMonths={2}
                                    selected={range}
                                    onSelect={handleChangeDateRange}
                                    disabled={{ after: new Date() }}
                                    autoFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Button
                            variant="secondary"
                            onClick={handleClearDateRange}
                            disabled={!startDate && !endDate}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </Card>

            {annotationTasks.length === 0 ? (
                <h1>No annotation tasks found</h1>
            ) : (
                annotationTasks.map(task => <h1 key={task.id}>{task.title}</h1>)
            )}

            <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-muted-foreground text-sm">
                        Page {page} of {totalPages}
                    </div>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => previousPage(totalPages)}
                                    aria-disabled={page === 1}
                                    className={
                                        page === 1
                                            ? 'pointer-events-none opacity-50'
                                            : undefined
                                    }
                                />
                            </PaginationItem>

                            {createPageRange(totalPages).map(
                                (pageNumber, index) =>
                                    pageNumber === 'ellipsis' ? (
                                        <PaginationItem
                                            key={`ellipsis-${index}`}
                                        >
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationLink
                                                isActive={page === pageNumber}
                                                onClick={() =>
                                                    goToPage(
                                                        pageNumber,
                                                        totalPages,
                                                    )
                                                }
                                            >
                                                {pageNumber}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ),
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => nextPage(totalPages)}
                                    aria-disabled={page === totalPages}
                                    className={
                                        page === totalPages
                                            ? 'pointer-events-none opacity-50'
                                            : undefined
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </Card>
        </div>
    );
}
