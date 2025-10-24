'use client';

import { AnnotationTaskDetailSkeleton } from './loading-skeleton';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { useAnnotationTaskProgressQuery } from '@/features/annotation/hooks/use-annotation-task-progress';
import { useTaskAnnotationsQuery } from '@/features/annotation/hooks/use-annotations';
import { formatDate } from '@/shared/core/utils/date';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { TaskProgressBreakdown } from './annotation-form-panel/task-progress-breakdown';
import { SpecimenMetadata } from './specimen-image-panel/specimen-metadata';
import { SpecimenImageViewer } from './specimen-image-panel/specimen-image-viewer';
import { AnnotationForm } from './annotation-form-panel/annotation-form';

interface AnnotationTaskDetailPageClientProps {
  taskId: number;
}

export function AnnotationTaskDetailPageClient({
  taskId,
}: AnnotationTaskDetailPageClientProps) {
  const [page, setPage] = useState(1);

  const {
    data: annotationsPage,
    isLoading,
    isFetching,
  } = useTaskAnnotationsQuery({
    taskId,
    page,
    limit: 1,
  });

  const { data: taskProgress } = useAnnotationTaskProgressQuery(taskId);

  const hasMore = Boolean(annotationsPage?.hasMore);

  const currentAnnotation = useMemo(
    () => annotationsPage?.items?.[0] ?? null,
    [annotationsPage],
  );

  const imageUrl = useMemo(() => {
    if (!currentAnnotation?.specimen) return null;

    const specimen = currentAnnotation.specimen;
    if (specimen.thumbnailImageId) {
      return `/api/bff/specimens/${specimen.id}/images/${specimen.thumbnailImageId}`;
    }

    const relativePath = specimen.thumbnailImage?.url ?? specimen.thumbnailUrl;
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    return `/api/bff${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
  }, [currentAnnotation?.specimen]);

  const handleNext = useCallback(() => {
    if (hasMore && !isFetching && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching, isLoading]);

  const handlePrevious = useCallback(() => {
    if (page > 1 && !isFetching && !isLoading) {
      setPage(prev => Math.max(prev - 1, 1));
    }
  }, [page, isFetching, isLoading]);

  if (isLoading) {
    return <AnnotationTaskDetailSkeleton />;
  }

  if (!currentAnnotation) {
    notFound();
  }

  const createdAt = currentAnnotation.createdAt
    ? formatDate(currentAnnotation.createdAt).monthYear
    : null;
  const totalImages = taskProgress?.total ?? annotationsPage?.total ?? null;
  const specimenId =
    currentAnnotation.specimen?.specimenId ??
    (currentAnnotation.specimen?.id
      ? `#${currentAnnotation.specimen.id}`
      : null);

  return (
    <div className="mx-auto grid h-full w-full max-w-6xl gap-6 p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(340px,1fr)]">
      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold">
              Specimen Image {totalImages ? `(${page} of ${totalImages})` : ''}
              <Badge variant="outline" className="ml-5">
                {currentAnnotation.status}
              </Badge>
            </CardTitle>
            {createdAt && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-sm font-medium"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {createdAt}
              </Badge>
            )}
          </div>
          {specimenId && (
            <p className="text-muted-foreground text-sm">ID: {specimenId}</p>
          )}
        </CardHeader>
        <CardContent className="flex-1">
          <SpecimenImageViewer imageUrl={imageUrl} />
        </CardContent>
        <CardFooter className="border-border/70 bg-muted/5 mt-auto border-t px-6 py-4">
          <SpecimenMetadata
            session={currentAnnotation.specimen?.session}
            site={currentAnnotation.specimen?.session?.site}
          />
        </CardFooter>
      </Card>

      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-lg font-semibold">
            Annotation Form
          </CardTitle>
          <TaskProgressBreakdown taskProgress={taskProgress} />
        </CardHeader>

        <CardContent className="pt-0">
          <AnnotationForm
            key={`annotation-${currentAnnotation.id}`}
            annotationId={currentAnnotation.id}
            defaultValues={{
              species: currentAnnotation.morphSpecies ?? undefined,
              sex: currentAnnotation.morphSex ?? undefined,
              abdomenStatus: currentAnnotation.morphAbdomenStatus ?? undefined,
              notes: currentAnnotation.notes ?? undefined,
              flagged: currentAnnotation.status === 'FLAGGED',
            }}
          />
        </CardContent>

        <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="min-w-[120px]"
            onClick={handlePrevious}
            disabled={page === 1 || isFetching || isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-w-[120px]"
            onClick={handleNext}
            disabled={!hasMore || isFetching || isLoading}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
