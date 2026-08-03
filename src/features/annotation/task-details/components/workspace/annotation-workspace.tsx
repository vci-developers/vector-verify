'use client';

import { annotationKeys } from '@/api/annotation/annotation-keys';
import { useGetAnnotations } from '@/api/annotation/hooks/use-get-annotations';
import { usePutAnnotationById } from '@/api/annotation/hooks/use-put-annotation-by-id';
import type { AnnotationStatus } from '@/api/annotation/validation/annotation-schema';
import type { GetAnnotationsQueryParams } from '@/api/annotation/validation/get-annotations-schema';
import type { PutAnnotationByIdRequestBody } from '@/api/annotation/validation/put-annotation-by-id-schema';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, PencilRuler } from 'lucide-react';
import { useState } from 'react';
import SpecimenImageViewer from '@/features/annotation/task-details/components/workspace/specimen-image-viewer';
import AnnotationReadonlyView from '@/features/annotation/task-details/components/workspace/annotation-readonly-view';
import AnnotationForm from '@/features/annotation/task-details/components/workspace/annotation-form';
import ErrorBanner from '@/components/ui/error-banner';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface AnnotationWorkspaceProps {
    taskId: number;
    status: AnnotationStatus;
    page: number;
    onPageChange: (page: number) => void;
}

export default function AnnotationWorkspace({
    taskId,
    status,
    page,
    onPageChange,
}: AnnotationWorkspaceProps) {
    const t = useTranslations('AnnotationWorkspace');
    const tCommon = useTranslations('Common');
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    const getAnnotationsQueryParams: GetAnnotationsQueryParams = {
        taskId,
        status,
        page: status === 'PENDING' ? 1 : page,
        limit: 1,
    };

    const { data: getAnnotationsResult, isPending: isGetAnnotationsPending } =
        useGetAnnotations(getAnnotationsQueryParams);
    const { mutate: updateAnnotation, isPending: isUpdateAnnotationPending } =
        usePutAnnotationById();

    function handleSubmitAnnotation(
        annotationId: number,
        requestBody: PutAnnotationByIdRequestBody,
    ) {
        updateAnnotation(
            { annotationId, requestBody },
            {
                onSuccess: result => {
                    if (result.ok) {
                        queryClient.invalidateQueries({
                            queryKey: annotationKeys.root,
                        });
                        setIsEditing(false);
                    } else {
                        toast.error(t('couldNotUpdate'));
                    }
                },
                onError: () => {
                    toast.error(t('couldNotUpdate'));
                },
            },
        );
    }

    function handlePageChange(newPage: number) {
        setIsEditing(false);
        onPageChange(newPage);
    }

    const isLoading = !getAnnotationsResult || isGetAnnotationsPending;

    const annotation = getAnnotationsResult?.ok
        ? getAnnotationsResult.data.annotations[0]
        : undefined;
    const total = getAnnotationsResult?.ok
        ? getAnnotationsResult.data.total
        : undefined;

    if (!isLoading && (!annotation || total === 0)) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                <PencilRuler className="text-muted-foreground/50 mb-4 h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                    {t('noAnnotationsFound')}
                </p>
            </div>
        );
    }

    const showForm = status === 'PENDING' || isEditing;

    return (
        <div className="space-y-4">
            {!isLoading && !getAnnotationsResult.ok && (
                <ErrorBanner message={t('couldNotRetrieve')} />
            )}
            <p className="text-muted-foreground text-sm">
                {status === 'PENDING'
                    ? t('numRemaining', { count: total ?? '---' })
                    : t('pageOfTotal', { page, total: total ?? '---' })}
            </p>

            <div className="grid grid-cols-2 gap-6">
                {!annotation ? (
                    <SpecimenImageViewer isLoading />
                ) : annotation.specimen ? (
                    <SpecimenImageViewer
                        key={annotation.specimen.id}
                        specimen={annotation.specimen}
                    />
                ) : (
                    <p className="text-muted-foreground text-sm">
                        {t('noSpecimenData')}
                    </p>
                )}

                {showForm ? (
                    <AnnotationForm
                        annotation={annotation}
                        isSubmitting={isUpdateAnnotationPending}
                        onSubmit={formData =>
                            handleSubmitAnnotation(
                                annotation?.id || -1,
                                formData,
                            )
                        }
                        onCancel={
                            status !== 'PENDING' && isEditing
                                ? () => setIsEditing(false)
                                : undefined
                        }
                        isLoading={isLoading}
                    />
                ) : (
                    <AnnotationReadonlyView
                        annotation={annotation}
                        onEdit={() => setIsEditing(true)}
                        isLoading={isLoading}
                    />
                )}
            </div>

            {total !== undefined && status !== 'PENDING' && !isEditing && (
                <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-muted-foreground text-sm">
                        {t('pageOfTotal', { page, total })}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            {tCommon('previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= total}
                        >
                            {tCommon('next')}
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
