'use client';

import Image from 'next/image';
import { useMemo, useState, useCallback } from 'react';
import { useTaskAnnotationsQuery } from '@/lib/annotate/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/shared/utils/date';
import { ArrowLeft, ArrowRight, ImageOff, Info, CalendarDays } from 'lucide-react';
import { AnnotationTaskDetailSkeleton } from '@/components/annotate/task-detail/loading-skeleton';

interface AnnotationTaskDetailPageClientProps {
  taskId: number;
}

export function AnnotationTaskDetailPageClient({
  taskId,
}: AnnotationTaskDetailPageClientProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } =
    useTaskAnnotationsQuery({
      taskId,
      page,
      limit: 1,
    });

  const hasMore = Boolean(data?.hasMore);

  const currentAnnotation = useMemo(() => data?.items?.[0] ?? null, [data]);
  const imageUrl = useMemo(() => {
    const specimen = currentAnnotation?.specimen;
    if (!specimen) return null;
    if (specimen.thumbnailImageId) {
      return `/api/bff/specimens/${specimen.id}/images/${specimen.thumbnailImageId}`;
    }
    const relativePath = specimen.thumbnailImage?.url ?? specimen.thumbnailUrl;
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    return `/api/bff${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
  }, [currentAnnotation]);

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

  const limit = data?.limit ?? 1;
  const totalImages = data?.total ?? null;
  const currentIndex = (page - 1) * limit + 1;

  if (isLoading) {
    return <AnnotationTaskDetailSkeleton />;
  }

  const createdAt = currentAnnotation?.createdAt
    ? formatDate(currentAnnotation.createdAt).monthYear
    : null;
  const specimenId =
    currentAnnotation?.specimen?.specimenId ??
    (currentAnnotation?.specimen?.id ? `#${currentAnnotation.specimen.id}` : null);

  return (
    <div className="mx-auto grid h-full w-full max-w-6xl gap-6 p-6 md:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)]">
      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-semibold">
                Specimen Image {totalImages ? `(${currentIndex} of ${totalImages})` : ''}
              </CardTitle>
              {specimenId && (
                <p className="text-muted-foreground text-sm">ID: {specimenId}</p>
              )}
            </div>
            {createdAt && (
              <Badge variant="outline" className="flex items-center gap-1 text-sm font-medium">
                <CalendarDays className="h-3.5 w-3.5" />
                {createdAt}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="border-border/60 bg-muted/30 relative flex h-[55vh] min-h-[320px] w-full items-center justify-center overflow-hidden rounded-lg border">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Specimen ${currentAnnotation?.specimen?.specimenId ?? currentAnnotation?.specimen?.id ?? ''}`}
                fill
                className="object-contain"
                unoptimized
                priority
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
                <ImageOff className="h-6 w-6" />
                <span>No image available.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle>Navigation</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col gap-3 text-sm">
          <p className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Use these controls to review specimens sequentially.
          </p>
          <div className="rounded-md border border-dashed border-border/80 bg-muted/40 px-3 py-2 text-xs">
            Tip: keyboard arrows (<strong>←</strong>/<strong>→</strong>) also move between specimens.
          </div>
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
