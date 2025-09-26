'use client';

import { AnnotationTaskDetailSkeleton } from '@/components/annotate/task-detail/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useAnnotationTaskProgressQuery,
  useTaskAnnotationsQuery,
} from '@/lib/annotate/client';
import { formatDate } from '@/lib/shared/utils/date';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ImageOff,
  Info,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';
import { TaskProgressBreakdown } from './annotation-form-panel/task-progress-breakdown';
import { SpecimenMetadata } from './specimen-image-panel/specimen-metadata';
import MorphIdSelectMenu from './annotation-form-panel/morph-id-select-menu';
import { SPECIES_MORPH_IDS, SEX_MORPH_IDS, ABDOMEN_STATUS_MORPH_IDS } from '@/lib/entities/specimen/morph-ids';

interface AnnotationTaskDetailPageClientProps {
  taskId: number;
}

export function AnnotationTaskDetailPageClient({
  taskId,
}: AnnotationTaskDetailPageClientProps) {
  const [page, setPage] = useState(1);
  const [selectedSpecies, setSelectedSpecies] = useState<string | undefined>(undefined);
  const [selectedSex, setSelectedSex] = useState<string | undefined>(undefined);
  const [selectedAbdomenStatus, setSelectedAbdomenStatus] = useState<string | undefined>(undefined);


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
    const specimen = currentAnnotation?.specimen;
    if (!specimen) return null;
    if (specimen.thumbnailImageId) {
      return `/api/bff/specimens/${specimen.id}/images/${specimen.thumbnailImageId}`;
    }
    return specimen.thumbnailUrl ?? null;
  }, [currentAnnotation]);

  const handleNext = useCallback(() => {
    if (hasMore && !isFetching && !isLoading) {
      setPage(prev => prev + 1);
    }
    setSelectedSpecies(undefined);
    setSelectedSex(undefined);
    setSelectedAbdomenStatus(undefined);
  }, [hasMore, isFetching, isLoading]);

  const handlePrevious = useCallback(() => {
    if (page > 1 && !isFetching && !isLoading) {
      setPage(prev => Math.max(prev - 1, 1));
    }
    setSelectedSpecies(undefined);
    setSelectedSex(undefined);
    setSelectedAbdomenStatus(undefined);
  }, [page, isFetching, isLoading]);

  const limit = annotationsPage?.limit ?? 1;
  const totalImages = taskProgress?.total ?? annotationsPage?.total ?? null;
  const currentIndex = (page - 1) * limit + 1;

  if (isLoading) {
    return <AnnotationTaskDetailSkeleton />;
  }

  const createdAt = currentAnnotation?.createdAt
    ? formatDate(currentAnnotation.createdAt).monthYear
    : null;
  const specimenId =
    currentAnnotation?.specimen?.specimenId ??
    (currentAnnotation?.specimen?.id
      ? `#${currentAnnotation.specimen.id}`
      : null);

  return (
    <div className="mx-auto grid h-full w-full max-w-6xl gap-6 p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(340px,1fr)]">
      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold">
              Specimen Image{' '}
              {totalImages ? `(${currentIndex} of ${totalImages})` : ''}
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
          {imageUrl ? (
            <div className="border-border/60 bg-muted/30 relative flex h-[55vh] min-h-[320px] w-full items-center justify-center overflow-hidden rounded-lg border">
              <Image
                src={imageUrl}
                alt={`Specimen ${currentAnnotation?.specimen?.specimenId ?? currentAnnotation?.specimen?.id ?? ''}`}
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          ) : (
            <p className="text-muted-foreground border-border/60 bg-muted/30 flex h-[55vh] min-h-[320px] w-full flex-col items-center justify-center gap-2 rounded-lg border text-sm">
              <ImageOff className="h-6 w-6" />
              No image available.
            </p>
          )}
        </CardContent>
        <CardFooter className="border-border/70 bg-muted/5 mt-auto border-t px-6 py-4">
          <SpecimenMetadata
            session={currentAnnotation?.specimen?.session}
            site={currentAnnotation?.specimen?.session?.site}
          />
        </CardFooter>
      </Card>

      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-lg font-semibold">
            Annotation Form
          </CardTitle>
          <TaskProgressBreakdown 
            taskProgress={taskProgress} 
          />
        </CardHeader>
        <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-foreground text-sm font-bold">Species</h3>
                <MorphIdSelectMenu
                  label="Species"
                  morphIds={Object.values(SPECIES_MORPH_IDS)}
                  selectedMorphId={selectedSpecies}
                  onMorphSelect={setSelectedSpecies}
                />
              </div>
        
              <div className="space-y-2">
                <h3 className="text-foreground text-sm font-bold">Sex</h3>
                <MorphIdSelectMenu
                  label="Sex"
                  morphIds={Object.values(SEX_MORPH_IDS)}
                  selectedMorphId={selectedSex}
                  onMorphSelect={setSelectedSex}
                />
              </div>
        
              <div className="space-y-2">
                <h3 className="text-foreground text-sm font-bold">Abdomen Status</h3>
                <MorphIdSelectMenu
                  label="Abdomen Status"
                  morphIds={Object.values(ABDOMEN_STATUS_MORPH_IDS)}
                  selectedMorphId={selectedAbdomenStatus}
                  onMorphSelect={setSelectedAbdomenStatus}
                />
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
