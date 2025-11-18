'use client';

import { AnnotationTaskDetailSkeleton } from './loading-skeleton';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import {
  Card,
  CardContent,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { TaskProgressBreakdown } from './annotation-form-panel/task-progress-breakdown';
import { SpecimenMetadata } from './specimen-image-panel/specimen-metadata';
import { SpecimenImageViewer } from './specimen-image-panel/specimen-image-viewer';
import { AnnotationForm } from './annotation-form-panel/annotation-form';
import { GENUS_MORPH_IDS, MORPH_ARTIFACTS } from '@/shared/entities/specimen/morph-ids';
import { cn } from '@/shared/core/utils';

interface AnnotationTaskDetailPageClientProps {
  taskId: number;
}

function parseMorphSpecies(morphSpecies?: string | null): {
  genus?: string;
  species?: string;
} {
  if (!morphSpecies) return {};

  if (morphSpecies.startsWith(GENUS_MORPH_IDS.ANOPHELES)) {
    const species = morphSpecies.substring(GENUS_MORPH_IDS.ANOPHELES.length);
    return {
      genus: GENUS_MORPH_IDS.ANOPHELES,
      species: species || undefined,
    };
  }

  return { genus: morphSpecies };
}

function parseNotesForArtifact(
  notes?: string | null,
  isFlagged?: boolean,
): {
  artifact?: string;
  notes?: string;
} {
  if (!isFlagged || !notes) return { notes: notes ?? undefined };

  const artifactValues = Object.values(MORPH_ARTIFACTS);
  if (artifactValues.includes(notes as any)) {
    return { artifact: notes, notes: undefined };
  }

  return { artifact: MORPH_ARTIFACTS.OTHER, notes };
}

export function AnnotationTaskDetailPageClient({
  taskId,
}: AnnotationTaskDetailPageClientProps) {
  const [page, setPage] = useState(1);
  const [genusChangeHandler, setGenusChangeHandler] = useState<((genus: string) => void) | null>(null);
  const [selectedGenus, setSelectedGenus] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    setSelectedGenus(undefined);
  }, [currentAnnotation?.id]);

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
          
          {(() => {
            const { genus } = parseMorphSpecies(currentAnnotation.morphSpecies);
            const currentGenus = selectedGenus ?? genus;
            const genusValues = Object.values(GENUS_MORPH_IDS);
            
            const handleGenusClick = (genusOption: string) => {
              setSelectedGenus(genusOption);
              genusChangeHandler?.(genusOption);
            };
            
            return (
              <div className="space-y-2">
                <p className="text-white text-sm font-medium text-muted-foreground">Genus</p>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {genusValues.slice(0, 3).map(genusOption => (
                      <Button
                        key={genusOption}
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full',
                          currentGenus === genusOption && 'bg-[#22c55e] text-white hover:bg-[#22c55e]/90 border-[#22c55e]',
                        )}
                        onClick={() => handleGenusClick(genusOption)}
                        disabled={!genusChangeHandler}
                      >
                        {genusOption}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {genusValues.slice(3).map(genusOption => (
                      <Button
                        key={genusOption}
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full',
                          currentGenus === genusOption && 'bg-[#22c55e] text-white hover:bg-[#22c55e]/90 border-[#22c55e]',
                        )}
                        onClick={() => handleGenusClick(genusOption)}
                        disabled={!genusChangeHandler}
                      >
                        {genusOption}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-lg font-semibold">
            Annotation Form
          </CardTitle>
          <TaskProgressBreakdown taskProgress={taskProgress} />
        </CardHeader>

        <CardContent className="pt-0">
          {(() => {
            const isFlagged = currentAnnotation.status === 'FLAGGED';
            const { genus, species } = parseMorphSpecies(currentAnnotation.morphSpecies);
            const { artifact, notes } = parseNotesForArtifact(
              currentAnnotation.notes,
              isFlagged,
            );

            return (
              <AnnotationForm
                key={`annotation-${currentAnnotation.id}`}
                annotationId={currentAnnotation.id}
                defaultValues={{
                  genus,
                  species,
                  sex: currentAnnotation.morphSex ?? undefined,
                  abdomenStatus: currentAnnotation.morphAbdomenStatus ?? undefined,
                  artifact,
                  notes,
                  flagged: isFlagged,
                }}
                onGenusChange={(handler) => setGenusChangeHandler(() => handler)}
              />
            );
          })()}
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
