'use client';

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
import {
  AnnotationFormInput,
  annotationFormSchema,
  isAbdomenStatusEnabled,
  isSexEnabled,
} from './validation/annotation-form-schema';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Flag, Save } from 'lucide-react';
import { toDomId } from '@/lib/shared/utils/dom';
import MorphIdSelectMenu from '../annotation-form-panel/morph-id-select-menu';
import {
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
} from '@/lib/entities/specimen/morph-ids';
import { useUpdateAnnotationMutation } from '@/lib/annotate/client';
import { useQueryClient } from '@tanstack/react-query';

interface AnnotationFormProps {
  className?: string;
  annotationId?: number;
  defaultValues?: {
    species?: string;
    sex?: string;
    abdomenStatus?: string;
    notes?: string;
    flagged?: boolean;
  };
}

export function AnnotationForm({
  className = '',
  annotationId,
  defaultValues,
}: AnnotationFormProps) {
  const queryClient = useQueryClient();
  const updateAnnotationMutation = useUpdateAnnotationMutation({
    onSuccess: () => {
      if (annotationId) {
        queryClient.invalidateQueries({ queryKey: ['annotations'] });
        queryClient.invalidateQueries({
          queryKey: ['annotation-task-progress'],
        });
      }
    },
  });

  const annotationForm = useForm<AnnotationFormInput>({
    resolver: zodResolver(annotationFormSchema),
    defaultValues: {
      species: defaultValues?.species ?? undefined,
      sex: defaultValues?.sex ?? undefined,
      abdomenStatus: defaultValues?.abdomenStatus ?? undefined,
      notes: defaultValues?.notes ?? undefined,
      flagged: defaultValues?.flagged ?? false,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const selectedSpecies = annotationForm.watch('species');
  const selectedSex = annotationForm.watch('sex');
  const isFlagged = annotationForm.watch('flagged');

  // Calculate enabled states for form fields
  const sexEnabled = isSexEnabled(selectedSpecies);
  const abdomenStatusEnabled = isAbdomenStatusEnabled(
    selectedSpecies,
    selectedSex,
  );

  const handleSpeciesSelect = (newSpecies?: string) => {
    annotationForm.setValue('species', newSpecies, { shouldDirty: true });
    if (!isSexEnabled(newSpecies)) {
      annotationForm.setValue('sex', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      annotationForm.setValue('abdomenStatus', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      annotationForm.clearErrors(['sex', 'abdomenStatus']);
    }
    annotationForm.clearErrors('species');
  };

  const handleSexSelect = (newSex?: string) => {
    annotationForm.setValue('sex', newSex, { shouldDirty: true });
    if (!isAbdomenStatusEnabled(selectedSpecies, newSex)) {
      annotationForm.setValue('abdomenStatus', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      annotationForm.clearErrors(['abdomenStatus']);
    }
    annotationForm.clearErrors('sex');
  };

  const handleAbdomenStatusSelect = (newAbdomenStatus?: string) => {
    annotationForm.setValue('abdomenStatus', newAbdomenStatus, {
      shouldDirty: true,
    });

    annotationForm.clearErrors('abdomenStatus');
  };

  const handleFlagged = (
    newFlagged: boolean,
    updateFormValue: (value: boolean) => void,
  ) => {
    updateFormValue(newFlagged);

    if (newFlagged) {
      annotationForm.clearErrors(['species', 'sex', 'abdomenStatus']);
    } else {
      annotationForm.clearErrors(['notes']);
    }
  };

  const handleValidSubmit = async (formInput: AnnotationFormInput) => {
    if (annotationId) {
      const status = formInput.flagged ? 'FLAGGED' : 'ANNOTATED';
      await updateAnnotationMutation.mutateAsync({
        annotationId,
        payload: {
          morphSpecies: formInput.species || null,
          morphSex: formInput.sex || null,
          morphAbdomenStatus: formInput.abdomenStatus || null,
          notes: formInput.notes || null,
          status,
        },
      });
    } else {
      console.warn(
        'No annotationId provided - Cannot submit form data:',
        formInput,
      );
    }
  };

  return (
    <Form {...annotationForm}>
      <form
        onSubmit={annotationForm.handleSubmit(handleValidSubmit)}
        className={cn('space-y-3', className)}
      >
        <fieldset
          disabled={
            annotationForm.formState.isSubmitting ||
            updateAnnotationMutation.isPending
          }
          className="space-y-3"
        >
          <FormField
            control={annotationForm.control}
            name="species"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Species
                </FormLabel>
                <FormControl>
                  <MorphIdSelectMenu
                    label="species"
                    morphIds={Object.values(SPECIES_MORPH_IDS)}
                    selectedMorphId={field.value}
                    onMorphSelect={handleSpeciesSelect}
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
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Sex
                </FormLabel>
                <FormControl>
                  <MorphIdSelectMenu
                    label="Sex"
                    morphIds={Object.values(SEX_MORPH_IDS)}
                    selectedMorphId={field.value}
                    onMorphSelect={handleSexSelect}
                    inValid={!!fieldState.error && sexEnabled}
                    disabled={!sexEnabled}
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
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Abdomen Status
                </FormLabel>
                <FormControl>
                  <MorphIdSelectMenu
                    label="Abdomen Status"
                    morphIds={Object.values(ABDOMEN_STATUS_MORPH_IDS)}
                    selectedMorphId={field.value}
                    onMorphSelect={handleAbdomenStatusSelect}
                    inValid={!!fieldState.error && abdomenStatusEnabled}
                    disabled={!abdomenStatusEnabled}
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
                    className="h-[70px] resize-none overflow-y-auto text-sm"
                    placeholder="Add observations..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
                  onPressedChange={newFlagged =>
                    handleFlagged(newFlagged, field.onChange)
                  }
                  variant="outline"
                  disabled={
                    annotationForm.formState.isSubmitting ||
                    updateAnnotationMutation.isPending
                  }
                  className={cn(
                    'flex-1',
                    'flex items-center justify-center gap-1.5 rounded-md border transition-colors',
                    'data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive data-[state=on]:border-destructive data-[state=on]:hover:bg-destructive/20 motion-safe:data-[state=on]:animate-pulse',
                    'data-[state=off]:bg-background data-[state=off]:border-input data-[state=off]:hover:bg-accent data-[state=off]:hover:text-accent-foreground',
                  )}
                >
                  <Flag
                    className={cn(
                      'h-4 w-4',
                      field.value
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                    )}
                  />
                  {field.value ? 'Specimen Flagged' : 'Flag Specimen'}
                </Toggle>
              )}
            />

            <Button
              type="submit"
              className="flex flex-1 items-center justify-center gap-1.5"
              disabled={
                annotationForm.formState.isSubmitting ||
                updateAnnotationMutation.isPending
              }
            >
              <Save className="h-4 w-4" />
              {annotationForm.formState.isSubmitting ||
              updateAnnotationMutation.isPending
                ? 'Submitting...'
                : 'Submit'}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
