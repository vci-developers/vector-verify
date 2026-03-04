'use client';

import { useGetAnnotationTasks } from '@/api/annotation-task/hooks/use-get-annotation-tasks';
import type { GetAnnotationTasksQueryParams } from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { type AnnotationTaskStatus } from '@/api/annotation-task/validation/annotation-task-schema';
import { Fragment, useEffect } from 'react';
import { usePagination } from '@/lib/hooks/use-pagination';
import AnnotationTaskCard from '@/features/annotation/components/tasks-list/annotation-task-card';
import AnnotationTasksPagination from '@/features/annotation/components/tasks-list/annotation-tasks-pagination';

interface AnnotationTasksListProps {
    status: AnnotationTaskStatus;
    startDate?: string;
    endDate?: string;
}

export default function AnnotationTasksList({
    status,
    startDate,
    endDate,
}: AnnotationTasksListProps) {
    const {
        page,
        limit,
        goToPage,
        nextPage,
        previousPage,
        resetPage,
        createPageRange,
    } = usePagination();

    useEffect(() => {
        resetPage();
    }, [status, startDate, endDate, resetPage]);

    const getAnnotationTasksQueryParams: GetAnnotationTasksQueryParams = {
        status,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        page,
        limit,
    };

    const {
        data: getAnnotationTasksResult,
        isPending: isGetAnnotationTasksPending,
    } = useGetAnnotationTasks(getAnnotationTasksQueryParams);

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
