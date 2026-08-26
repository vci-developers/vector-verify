'use client';

import { useGetAnnotationTasks } from '@/api/annotation-task/hooks/use-get-annotation-tasks';
import type { GetAnnotationTasksQueryParams } from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import { type AnnotationTaskStatus } from '@/api/annotation-task/validation/annotation-task-schema';
import { Fragment, useEffect } from 'react';
import { usePagination } from '@/lib/hooks/use-pagination';
import AnnotationTaskCard from '@/features/annotation/tasks-list/components/tasks/annotation-task-card';
import AnnotationTasksPagination from '@/features/annotation/tasks-list/components/layout/annotation-tasks-pagination';
import { Separator } from '@/components/ui/separator';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { PencilRuler } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ErrorBanner from '@/components/ui/error-banner';

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
    const t = useTranslations('Annotation');
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

    const {
        data: getAnnotationTasksResult,
        isPending: isGetAnnotationTasksPending,
    } = useGetAnnotationTasks(getAnnotationTasksQueryParams);

    if (isGetAnnotationTasksPending || !getAnnotationTasksResult) {
        return <SkeletonList count={3} height="xl" width="full" />;
    }

    if (!getAnnotationTasksResult.ok) {
        return <ErrorBanner message={t('couldNotRetrieve')} />;
    }

    const annotationTasks = getAnnotationTasksResult.data.tasks;
    const totalItems = getAnnotationTasksResult.data.total;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return (
        <div className="space-y-4">
            {annotationTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                    <PencilRuler className="text-muted-foreground/50 mb-4 h-12 w-12" />
                    <p className="text-muted-foreground text-sm">
                        {t('noAnnotationTasksFound')}
                    </p>
                </div>
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
