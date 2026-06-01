'use client';

import { useGetAnnotationTasks } from '@/api/annotation-task/hooks/use-get-annotation-tasks';
import type { GetAnnotationTasksQueryParams } from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { type AnnotationTaskStatus } from '@/api/annotation-task/validation/annotation-task-schema';
import { Fragment, useEffect } from 'react';
import { usePagination } from '@/lib/hooks/use-pagination';
import AnnotationTaskCard from '@/features/annotation/tasks-list/components/tasks/annotation-task-card';
import AnnotationTasksPagination from '@/features/annotation/tasks-list/components/layout/annotation-tasks-pagination';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

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
    } = usePagination({ limit: 10 });

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

    const t = useTranslations('Annotation');

    const {
        data: getAnnotationTasksResult,
        isPending: isGetAnnotationTasksPending,
        refetch,
    } = useGetAnnotationTasks(getAnnotationTasksQueryParams);

    if (isGetAnnotationTasksPending || !getAnnotationTasksResult) {
        return <SkeletonList count={limit} height="xl" width="full" />;
    }

    if (!getAnnotationTasksResult.ok) {
        return <ErrorState onRetry={refetch} cardClassName="h-96 w-full" />;
    }

    const annotationTasks = getAnnotationTasksResult.data.tasks;
    const totalItems = getAnnotationTasksResult.data.total;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return (
        <div className="space-y-4">
            {annotationTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    {t('noTasksAssigned')}
                </p>
            ) : (
                <div className="space-y-3">
                    {annotationTasks.map(task => (
                        <AnnotationTaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <Fragment>
                    <Separator />

                    <AnnotationTasksPagination
                        page={page}
                        totalPages={totalPages}
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
