'use client';

import { AnnotationTaskDetailSkeleton } from './loading-skeleton';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/ui/hover-card';
import { useAnnotationTaskProgressQuery } from '@/features/annotation/hooks/use-annotation-task-progress';
import { useTaskAnnotationsQuery } from '@/features/annotation/hooks/use-annotations';
import { formatDate } from '@/shared/core/utils/date';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notFound } from 'next/navigation';
import { TaskProgressBreakdown } from './annotation-form-panel/task-progress-breakdown';
import { SpecimenMetadata } from './specimen-image-panel/specimen-metadata';
import { SpecimenImageViewer } from './specimen-image-panel/specimen-image-viewer';
import { VisualIdentificationForm } from './annotation-form-panel/visual-identification-form';
import {
  MorphIdentificationForm,
  type MorphIdentificationFormRef,
} from './annotation-form-panel/morph-identification-form';
import { useShouldProcessFurther } from './hooks/use-should-process-further';
import {
  getMorphFormDefaultValues,
  parseMorphSpecies,
  type MorphFormDefaultValues,
} from './utils/morph-form-defaults';
import {
  GENUS_VISUAL_IDS,
  ARTIFACT_VISUAL_IDS,
} from './annotation-form-panel/validation/annotation-form-schema';
import { cn } from '@/shared/core/utils';

interface AnnotationTaskDetailPageClientProps {
  taskId: number;
}

function parseNotesForArtifact(
  notes?: string | null,
  isFlagged?: boolean,
): {
  artifact?: string;
  notes?: string;
} {
  if (!isFlagged || !notes) return { notes: notes ?? undefined };

  const artifactValues = Object.values(ARTIFACT_VISUAL_IDS);
  if (artifactValues.includes(notes as any)) {
    return { artifact: notes, notes: undefined };
  }

  return { artifact: ARTIFACT_VISUAL_IDS.OTHER, notes };
}

export function AnnotationTaskDetailPageClient({
  taskId,
}: AnnotationTaskDetailPageClientProps) {
  const [page, setPage] = useState(1);
  const [morphFormValues, setMorphFormValues] =
    useState<MorphFormDefaultValues | null>(null);
  const morphFormRef = useRef<MorphIdentificationFormRef>(null);
  const genusChangeHandlerRef = useRef<((genus: string) => void) | null>(null);
  const [selectedGenus, setSelectedGenus] = useState<string | undefined>();

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

  const { shouldProcessFurther, isLoading: isLoadingShouldProcessFurther } =
    useShouldProcessFurther(currentAnnotation?.specimen);

  const morphFormDefaultValues = useMemo<MorphFormDefaultValues | null>(() => {
    if (!shouldProcessFurther || !currentAnnotation) {
      return null;
    }
    return getMorphFormDefaultValues(currentAnnotation);
  }, [shouldProcessFurther, currentAnnotation]);

  useEffect(() => {
    setMorphFormValues(morphFormDefaultValues);
  }, [morphFormDefaultValues]);

  useEffect(() => {
    if (currentAnnotation) {
      const { genus } = parseMorphSpecies(currentAnnotation.visualSpecies);
      setSelectedGenus(genus);
    }
  }, [currentAnnotation?.id]);
  const handleGenusChangeCallback = useCallback((handler: (genus: string) => void) => {
    genusChangeHandlerRef.current = handler;
  }, []);

  const handleGenusValueChange = useCallback((genus: string | undefined) => {
    setSelectedGenus(genus);
  }, []);

  const handleGenusButtonClick = useCallback((genus: string) => {
    if (genusChangeHandlerRef.current) {
      genusChangeHandlerRef.current(genus);
    }
  }, []);

  if (isLoading || isLoadingShouldProcessFurther) {
    return (
      <AnnotationTaskDetailSkeleton
        shouldProcessFurther={shouldProcessFurther}
      />
    );
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

  const gridCols = shouldProcessFurther
    ? 'md:grid-cols-[minmax(0,1.4fr)_minmax(380px,1fr)_minmax(380px,1fr)]'
    : 'md:grid-cols-[1fr_1fr]';
  const maxWidth = shouldProcessFurther ? 'max-w-[1800px]' : 'max-w-6xl';

  return (
    <div
      className={`mx-auto grid h-full w-full ${maxWidth} gap-6 p-6 ${gridCols}`}
    >
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
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="text-muted-foreground text-left text-sm underline decoration-dotted underline-offset-4 hover:text-foreground transition-colors">
                  More Information
                </button>
              </HoverCardTrigger>
              <HoverCardContent align="start" className="w-80">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Specimen ID: {specimenId}</p>
                  <SpecimenMetadata
                    session={currentAnnotation.specimen?.session}
                    site={currentAnnotation.specimen?.session?.site}
                  />
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <SpecimenImageViewer imageUrl={imageUrl} />
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Select Genus</p>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {Object.values(GENUS_VISUAL_IDS).slice(0, 3).map((genus) => (
                  <Button
                    key={genus}
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full',
                      selectedGenus === genus && 'bg-[#22c55e] text-white hover:bg-[#22c55e]/90 border-[#22c55e]',
                    )}
                    onClick={() => handleGenusButtonClick(genus)}
                    disabled={isLoading || isFetching}
                  >
                    {genus}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(GENUS_VISUAL_IDS).slice(3).map((genus) => (
                  <Button
                    key={genus}
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full',
                      selectedGenus === genus && 'bg-[#22c55e] text-white hover:bg-[#22c55e]/90 border-[#22c55e]',
                    )}
                    onClick={() => handleGenusButtonClick(genus)}
                    disabled={isLoading || isFetching}
                  >
                    {genus}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              Visual Identification Form
            </CardTitle>
            <CardDescription>
              Identify the specimen by visually examining the image.
            </CardDescription>
          </div>
          <TaskProgressBreakdown taskProgress={taskProgress} />
        </CardHeader>

        <CardContent className="pt-0">
          <VisualIdentificationForm
            key={`annotation-${currentAnnotation.id}`}
            annotationId={currentAnnotation.id}
            defaultValues={{
              ...parseMorphSpecies(currentAnnotation.visualSpecies),
              ...parseNotesForArtifact(
                currentAnnotation.notes,
                currentAnnotation.status === 'FLAGGED',
              ),
              sex: currentAnnotation.visualSex ?? undefined,
              abdomenStatus: currentAnnotation.visualAbdomenStatus ?? undefined,
              flagged: currentAnnotation.status === 'FLAGGED',
            }}
            onGenusChange={handleGenusChangeCallback}
            onGenusValueChange={handleGenusValueChange}
            morphFormValues={morphFormValues}
            shouldProcessFurther={shouldProcessFurther}
            morphFormRef={morphFormRef}
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

      {shouldProcessFurther && (
        <Card className="flex h-full flex-col overflow-hidden shadow-sm">
          <CardHeader className="space-y-3">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">
                Morph Identification Annotation Form
              </CardTitle>
              <CardDescription>
                Identify the specimen by examining it under a microscope.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <MorphIdentificationForm
              ref={morphFormRef}
              key={`morph-${currentAnnotation.id}`}
              defaultValues={
                morphFormDefaultValues ?? {
                  received: false,
                }
              }
              onValuesChange={setMorphFormValues}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
