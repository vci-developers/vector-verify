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
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/shared/utils/date';
import { ArrowLeft, ArrowRight, CalendarDays, Info, Flag, Save } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TaskProgressBreakdown } from './annotation-form-panel/task-progress-breakdown';
import { SpecimenMetadata } from './specimen-image-panel/specimen-metadata';
import { SpecimenImageViewer } from './specimen-image-panel/specimen-image-viewer';
import MorphIdSelectMenu from './annotation-form-panel/morph-id-select-menu';
import {
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
} from '@/lib/entities/specimen/morph-ids';

interface AnnotationTaskDetailPageClientProps {
  taskId: number;
}

export function AnnotationTaskDetailPageClient({
  taskId,
}: AnnotationTaskDetailPageClientProps) {
  const [page, setPage] = useState(1);
  const [selectedSpecies, setSelectedSpecies] = useState<string | undefined>();
  const [selectedSex, setSelectedSex] = useState<string | undefined>();
  const [selectedAbdomenStatus, setSelectedAbdomenStatus] = useState<string | undefined>();
  const [isFlagged, setIsFlagged] = useState(false);
  const [notes, setNotes] = useState('');

  const lockingSpecies = SPECIES_MORPH_IDS.NON_MOSQUITO;
  const lockingOutFromSpecies = selectedSpecies === lockingSpecies;
  const lockingSex = SEX_MORPH_IDS.MALE;
  const lockingOutFromSex = selectedSex === lockingSex;

  useEffect(() => {
    if (lockingOutFromSpecies) {
      if (selectedSex !== undefined) setSelectedSex(undefined);
      if (selectedAbdomenStatus !== undefined) setSelectedAbdomenStatus(undefined);
      return;
    }
    if (lockingOutFromSex && selectedAbdomenStatus !== undefined) {
      setSelectedAbdomenStatus(undefined);
    }
  }, [lockingOutFromSpecies, lockingOutFromSex, selectedSex, selectedAbdomenStatus]);

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
    const relativePath = specimen.thumbnailImage?.url ?? specimen.thumbnailUrl;
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    return `/api/bff${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
  }, [currentAnnotation]);

  const handleFlagged = useCallback(() => {
    setIsFlagged(!isFlagged);
    console.log('Flagging specimen', {
      specimenId: currentAnnotation?.specimen?.id,
      flagged: !isFlagged,
      notes: notes.trim() || "Flagged for review"
    })
  }, [isFlagged, currentAnnotation, notes]);

  const handleSave = useCallback(() => {
    console.log('Saving annotation', {
      species: selectedSpecies,
      sex: selectedSex,
      abdomenStatus: selectedAbdomenStatus,
      notes: notes.trim() || undefined,
      specimenId: currentAnnotation?.specimen?.id,
      flagged: isFlagged,
    })

    setSelectedSpecies(undefined);
    setSelectedSex(undefined);
    setSelectedAbdomenStatus(undefined);
    setIsFlagged(false);
    setNotes('');
    
  }, [selectedSpecies, selectedSex, selectedAbdomenStatus, notes, isFlagged, currentAnnotation]);

  const handleNext = useCallback(() => {
    if (hasMore && !isFetching && !isLoading) {
      setPage(prev => prev + 1);
      setSelectedSpecies(undefined);
      setSelectedSex(undefined);
      setSelectedAbdomenStatus(undefined);
    }
  }, [hasMore, isFetching, isLoading]);

  const handlePrevious = useCallback(() => {
    if (page > 1 && !isFetching && !isLoading) {
      setPage(prev => Math.max(prev - 1, 1));
      setSelectedSpecies(undefined);
      setSelectedSex(undefined);
      setSelectedAbdomenStatus(undefined);
    }
  }, [page, isFetching, isLoading]);

  const createdAt = currentAnnotation?.createdAt
    ? formatDate(currentAnnotation.createdAt).monthYear
    : null;
  const totalImages = taskProgress?.total ?? annotationsPage?.total ?? null;
  const specimenId =
    currentAnnotation?.specimen?.specimenId ??
    (currentAnnotation?.specimen?.id
      ? `#${currentAnnotation.specimen.id}`
      : null);

  if (isLoading) {
    return <AnnotationTaskDetailSkeleton />;
  }

  return (
    <div className="mx-auto grid h-full w-full max-w-6xl gap-6 p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(340px,1fr)]">
      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold">
              Specimen Image{' '}
              {totalImages ? `(${page} of ${totalImages})` : ''}
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
          <TaskProgressBreakdown taskProgress={taskProgress} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
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
                disabled={lockingOutFromSpecies}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-foreground text-sm font-bold">Abdomen Status</h3>
              <MorphIdSelectMenu
                label="Abdomen Status"
                morphIds={Object.values(ABDOMEN_STATUS_MORPH_IDS)}
                selectedMorphId={selectedAbdomenStatus}
                onMorphSelect={setSelectedAbdomenStatus}
                disabled={lockingOutFromSpecies || lockingOutFromSex}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-foreground text-sm font-bold">Notes</h3>
              <Textarea
                className="h-[70px] resize-none text-sm overflow-y-auto"
                placeholder="Add observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Toggle
                pressed={isFlagged}
                onPressedChange={setIsFlagged}
                variant="outline"
                disabled={isFetching || isLoading}
                data-state={isFlagged ? 'on' : 'off'}
                className={cn(
                  "flex-1", 
                  "flex items-center justify-center gap-1.5 rounded-md border transition-colors",
                  "data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive data-[state=on]:border-destructive data-[state=on]:hover:bg-destructive/20 motion-safe:data-[state=on]:animate-pulse",
                  "data-[state=off]:bg-background data-[state=off]:border-input data-[state=off]:hover:bg-accent data-[state=off]:hover:text-accent-foreground"
                )}
              >
                <Flag className={cn(
                  "h-4 w-4", 
                  isFlagged ? "text-destructive" : "text-muted-foreground"
                )} />
                {isFlagged ? 'Specimen Flagged' : 'Flag Specimen'}
              </Toggle>

              <Button
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5" 
                onClick={handleSave}
                disabled={isFetching || isLoading}
              >
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
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
