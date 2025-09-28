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
  annotationFormSchema,
  AnnotationFormOutput,
  AnnotationFormInput
} from './annotation-form-panel/validation/annotation-form-schema';
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
import { toDomId } from '@/lib/shared/utils/dom';
import {
  Form,  
  FormField,
  FormControl, 
  FormItem, 
  FormLabel, 
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
interface AnnotationTaskDetailPageClientProps {
  taskId: number;
  onSubmit?: (values: AnnotationFormOutput) => Promise<void> | void;
  className?: string;
}

export function AnnotationTaskDetailPageClient({
  taskId,
  onSubmit,
  className,
}: AnnotationTaskDetailPageClientProps) {
  const [page, setPage] = useState(1);

  const annotationForm = useForm<AnnotationFormInput>({
    resolver: zodResolver(annotationFormSchema),
    defaultValues: {
      species: undefined,
      sex: undefined,
      abdomenStatus: undefined,
      notes: undefined,
      flagged: false,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const selectedSpecies = annotationForm.watch('species');
  const selectedSex = annotationForm.watch('sex');
  const selectedAbdomenStatus = annotationForm.watch('abdomenStatus');
  const isFlagged = annotationForm.watch('flagged');

  const lockingSpecies = SPECIES_MORPH_IDS.NON_MOSQUITO;
  const lockingOutFromSpecies = selectedSpecies === lockingSpecies;
  const lockingSex = SEX_MORPH_IDS.MALE;
  const lockingOutFromSex = selectedSex === lockingSex;

  useEffect(() => {
    if (lockingOutFromSpecies) {
      annotationForm.setValue('sex', undefined);
      annotationForm.setValue('abdomenStatus', undefined);
      annotationForm.clearErrors(['sex', 'abdomenStatus']);
      return;
    }
    if (lockingOutFromSex) {
      annotationForm.setValue('abdomenStatus', undefined);
      annotationForm.clearErrors(['abdomenStatus']);
      return;
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

  const handleFlagged = (
    newFlagged: boolean,
    updateFormValue: (value: boolean) => void
  ) => {
    updateFormValue(newFlagged);

    if (newFlagged) {
      annotationForm.clearErrors(["species", "sex", "abdomenStatus"])
    } else {
      annotationForm.clearErrors(["notes"])
    }
  }


  const handleNext = useCallback(() => {
    if (hasMore && !isFetching && !isLoading) {
      setPage(prev => prev + 1);
      annotationForm.reset();
    }
  }, [hasMore, isFetching, isLoading]);

  const handlePrevious = useCallback(() => {
    if (page > 1 && !isFetching && !isLoading) {
      setPage(prev => Math.max(prev - 1, 1));
      annotationForm.reset();
    }
  }, [page, isFetching, isLoading]);

  const handleValidSubmit = (formInput: AnnotationFormInput) => {
    const validatedFormOutput = annotationFormSchema.parse(formInput);
    if (typeof onSubmit === 'function') {
      return onSubmit(validatedFormOutput);
    }
    console.warn('onSubmit prop not provided - Data:', validatedFormOutput);
  };


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
      <div>
        <CardContent className = "pt-0">
          <Form {...annotationForm}>
            <form
              onSubmit={annotationForm.handleSubmit(handleValidSubmit)}
              className={cn("space-y-3", className)}
            >
              <fieldset
                disabled={annotationForm.formState.isSubmitting}
                className="space-y-3"
              >
                <FormField
                  control={annotationForm.control}
                  name="species"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor={toDomId(field.name)} className="m-0">Species</FormLabel>
                      <FormControl>
                        <MorphIdSelectMenu
                          label="Species"
                          morphIds={Object.values(SPECIES_MORPH_IDS)}
                          selectedMorphId={field.value}
                          onMorphSelect={(value) => field.onChange(value)}
                          inValid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>

                  )}
                />

                    <FormField
                  control={annotationForm.control}
                  name="sex"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor={toDomId(field.name)} className="m-0">Sex</FormLabel>
                      <FormControl>
                        <MorphIdSelectMenu
                          label="Sex"
                          morphIds={Object.values(SEX_MORPH_IDS)}
                          selectedMorphId={field.value}
                          onMorphSelect={(value) => field.onChange(value)}
                          disabled={lockingOutFromSpecies}
                          inValid={!!fieldState.error && !lockingOutFromSpecies}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>

                  )}
                />

                <FormField
                  control={annotationForm.control}
                  name="abdomenStatus"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor={toDomId(field.name)} className="m-0">Abdomen Status</FormLabel>
                      <FormControl>
                        <MorphIdSelectMenu
                          label="Abdomen Status"
                          morphIds={Object.values(ABDOMEN_STATUS_MORPH_IDS)}
                          selectedMorphId={field.value}
                          onMorphSelect={(value) => field.onChange(value)}
                          disabled={lockingOutFromSpecies || lockingOutFromSex}
                          inValid={!!fieldState.error && !(lockingOutFromSpecies || lockingOutFromSex)}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>

                  )}
                />

                    <FormField
                      control={annotationForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                            Notes
                            {isFlagged && (
                              <span className="text-destructive">(Required)*</span>
                            )}
                            </FormLabel>
                          <FormControl>
                            <Textarea
                              id={toDomId(field.name)}
                              className="h-[70px] resize-none text-sm overflow-y-auto"
                              placeholder="Add observations..."
                              {...field}
                              />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 pt-2">
                      <FormField
                        control={annotationForm.control}
                        name="flagged"
                        render={({ field }) => (
                          <Toggle
                            pressed={field.value}
                            onPressedChange={(newFlagged) => handleFlagged(newFlagged, field.onChange)}
                            variant="outline"
                            disabled={annotationForm.formState.isSubmitting}
                            className={cn(
                              "flex-1", 
                              "flex items-center justify-center gap-1.5 rounded-md border transition-colors",
                              "data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive data-[state=on]:border-destructive data-[state=on]:hover:bg-destructive/20 motion-safe:data-[state=on]:animate-pulse",
                              "data-[state=off]:bg-background data-[state=off]:border-input data-[state=off]:hover:bg-accent data-[state=off]:hover:text-accent-foreground"
                            )}
                          >
                            <Flag className={cn(
                              "h-4 w-4", 
                              field.value ? "text-destructive" : "text-muted-foreground"
                            )} />
                            {field.value ? 'Specimen Flagged' : 'Flag Specimen'}
                          </Toggle>
                        )}
                          
                      />
                      

                      <Button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-1.5" 
                        disabled={annotationForm.formState.isSubmitting}
                      >
                        <Save className="h-4 w-4" /> 
                        {annotationForm.formState.isSubmitting ? 'Submitting...' : 'Submit'}
                      </Button>
                    </div>

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
              </fieldset>
            </form>
          </Form>
        </CardContent>
        
      </div>
        
      </Card>
    </div>
  );
}
