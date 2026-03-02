'use client';

import { useGetAnnotationTasks } from '@/api/annotation-task/hooks/use-get-annotation-tasks';
import type { GetAnnotationTasksQueryParams } from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { type AnnotationTaskStatus } from '@/api/annotation-task/validation/annotation-task-schema';
import { Fragment, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { usePagination } from '@/lib/hooks/use-pagination';
import AnnotationTasksFilters from './annotation-tasks-filters';
import AnnotationTaskCard from './annotation-task-card';
import AnnotationTasksPagination from './annotation-tasks-pagination';

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

    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined,
    );
    const [status, setStatus] = useState<AnnotationTaskStatus>('PENDING');

    const startDate = dateRange?.from
        ? dateRange.from.toISOString()
        : undefined;
    const endDate = dateRange?.to ? dateRange.to.toISOString() : undefined;

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

    function handleDateRangeChange(newRange: DateRange | undefined) {
        setDateRange(newRange);
        resetPage();
    }

    function handleClearDateRange() {
        setDateRange(undefined);
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
            <AnnotationTasksFilters
                status={status}
                dateRange={dateRange}
                onStatusChange={handleStatusChange}
                onDateRangeChange={handleDateRangeChange}
                onClearDateRange={handleClearDateRange}
            />

            <div className="border-border/50 border-t" />

            {annotationTasks.length === 0 ? (
                <h1>No annotation tasks found</h1>
            ) : (
                <div className="space-y-3">
                    {annotationTasks.map(task => (
                        <AnnotationTaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <Fragment>
                    <div className="border-border/50 border-t" />
                    <AnnotationTasksPagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageRange={createPageRange(totalPages)}
                        onPageChange={newPage => goToPage(newPage, totalPages)}
                        onPrevious={() => previousPage(totalPages)}
                        onNext={() => nextPage(totalPages)}
                    />
                </Fragment>
            )}
        </div>
    );
}
