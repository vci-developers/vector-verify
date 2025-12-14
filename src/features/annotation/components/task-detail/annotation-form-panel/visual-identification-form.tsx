'use client';

import React, { useEffect, useCallback } from 'react';
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AnnotationFormInput,
  annotationFormSchema,
  isAbdomenStatusEnabled,
  isSexEnabled,
  isSpeciesEnabled,
  isNotesRequired,
  GENUS_VISUAL_IDS,
  SPECIES_VISUAL_IDS,
  SEX_VISUAL_IDS,
  ABDOMEN_STATUS_VISUAL_IDS,
  ARTIFACT_VISUAL_IDS,
} from './validation/annotation-form-schema';
import { cn } from '@/shared/core/utils';
import { Textarea } from '@/ui/textarea';
import { Button } from '@/ui/button';
import { Toggle } from '@/ui/toggle';
import { Flag, Save } from 'lucide-react';
import { toDomId } from '@/shared/core/utils/dom';
import { AnnotationSelectMenu } from './annotation-select-menu';
import { useUpdateAnnotationMutation } from '@/features/annotation/hooks/use-update-annotation';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccessToast } from '@/ui/show-success-toast';
import type { MorphIdentificationFormRef } from './morph-identification-form';

interface VisualIdentificationFormProps {
  annotationId: number;
  defaultValues: {
    genus?: string;
    species?: string;
    sex?: string;
    abdomenStatus?: string;
    artifact?: string;
    notes?: string;
    flagged?: boolean;
  };
  onGenusChange?: (handler: (genus: string) => void) => void;
  morphFormValues?: {
    received: boolean;
    species?: string;
    sex?: string;
    abdomenStatus?: string;
  } | null;
  shouldProcessFurther?: boolean;
  morphFormRef?: React.RefObject<MorphIdentificationFormRef | null>;
}

export function VisualIdentificationForm({
  annotationId,
  defaultValues,
  onGenusChange,
  morphFormValues,
  shouldProcessFurther = false,
  morphFormRef,
}: VisualIdentificationFormProps) {
  const queryClient = useQueryClient();
  const updateAnnotationMutation = useUpdateAnnotationMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      queryClient.invalidateQueries({ queryKey: ['annotation-task-progress'] });
      showSuccessToast('Annotation submitted successfully.');
    },
  });

  const form = useForm<AnnotationFormInput>({
    resolver: zodResolver(annotationFormSchema),
    defaultValues: {
      genus: defaultValues?.genus ?? undefined,
      species: defaultValues?.species ?? undefined,
      sex: defaultValues?.sex ?? undefined,
      abdomenStatus: defaultValues?.abdomenStatus ?? undefined,
      artifact: defaultValues?.artifact ?? undefined,
      notes: defaultValues?.notes ?? undefined,
      flagged: defaultValues?.flagged ?? false,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const selectedGenus = form.watch('genus');
  const selectedSex = form.watch('sex');
  const selectedArtifact = form.watch('artifact');
  const isFlagged = form.watch('flagged');

  const speciesEnabled = isSpeciesEnabled(selectedGenus);
  const sexEnabled = isSexEnabled(selectedGenus);
  const abdomenStatusEnabled = isAbdomenStatusEnabled(selectedGenus, selectedSex);
  const notesRequired = isNotesRequired(selectedArtifact);

  const handleGenusSelect = useCallback((newGenus?: string) => {
    form.setValue('genus', newGenus || '', { shouldDirty: true });

    // Clear species if not Anopheles
    if (!isSpeciesEnabled(newGenus)) {
      form.setValue('species', '', { shouldDirty: true });
      form.clearErrors(['species']);
    }

    // Clear sex if Non-Mosquito
    if (!isSexEnabled(newGenus)) {
      form.setValue('sex', '', { shouldDirty: true });
      form.setValue('abdomenStatus', '', { shouldDirty: true });
      form.clearErrors(['sex', 'abdomenStatus']);
    }

    form.clearErrors('genus');
  }, [form]);

  // Expose the handleGenusSelect function to parent via callback
  useEffect(() => {
    if (onGenusChange) {
      onGenusChange(handleGenusSelect);
    }
  }, [onGenusChange, handleGenusSelect]);

  const handleSpeciesSelect = (newSpecies?: string) => {
    form.setValue('species', newSpecies || '', { shouldDirty: true });
    form.clearErrors('species');
  };

  const handleSexSelect = (newSex?: string) => {
    form.setValue('sex', newSex || '', { shouldDirty: true });

    if (!isAbdomenStatusEnabled(selectedGenus, newSex)) {
      form.setValue('abdomenStatus', '', { shouldDirty: true });
      form.clearErrors(['abdomenStatus']);
    }
    form.clearErrors('sex');
  };

  const handleAbdomenStatusSelect = (newAbdomenStatus?: string) => {
    form.setValue('abdomenStatus', newAbdomenStatus || '', {
      shouldDirty: true,
    });
    form.clearErrors('abdomenStatus');
  };

  const handleArtifactSelect = (newArtifact?: string) => {
    form.setValue('artifact', newArtifact || '', { shouldDirty: true });

    // Clear notes if artifact is not "Other"
    if (!isNotesRequired(newArtifact)) {
      form.setValue('notes', '', { shouldDirty: true });
    }

    form.clearErrors('artifact');
  };

  const handleFlagged = (
    newFlagged: boolean,
    updateFormValue: (value: boolean) => void,
  ) => {
    updateFormValue(newFlagged);

    if (newFlagged) {
      // When flagging, just clear genus/species/sex/abdomen errors since they're not required
      form.clearErrors(['genus', 'species', 'sex', 'abdomenStatus']);
    } else {
      // When unflagging, clear artifact/notes errors since they're not required
      form.clearErrors(['artifact', 'notes']);
    }
  };

  const handleValidSubmit = async (formInput: AnnotationFormInput) => {
    let morphSpecies = null;
    let notes = null;

    if (formInput.flagged) {
      if (formInput.artifact === ARTIFACT_VISUAL_IDS.OTHER) {
        notes = formInput.notes || null;
      } else {
        notes = formInput.artifact || null;
      }

      if (formInput.genus) {
        if (formInput.genus === GENUS_VISUAL_IDS.ANOPHELES && formInput.species) {
          morphSpecies = `${formInput.genus}${formInput.species}`;
        } else {
          morphSpecies = formInput.genus;
        }
      }
    } else {
      if (formInput.genus === GENUS_VISUAL_IDS.ANOPHELES && formInput.species) {
        morphSpecies = `${formInput.genus}${formInput.species}`;
      } else {
        morphSpecies = formInput.genus || null;
      }

      if (formInput.artifact) {
        if (formInput.artifact === ARTIFACT_VISUAL_IDS.OTHER) {
          notes = formInput.notes || null;
        } else {
          notes = formInput.artifact;
        }
      } else {
        notes = formInput.notes || null;
      }
    }

    await updateAnnotationMutation.mutateAsync({
      annotationId,
      payload: {
        morphSpecies,
        morphSex: formInput.sex || null,
        morphAbdomenStatus: formInput.abdomenStatus || null,
        notes,
        status: formInput.flagged ? 'FLAGGED' : 'ANNOTATED',
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleValidSubmit)}
        className="space-y-3"
      >
        <fieldset
          disabled={updateAnnotationMutation.isPending}
          className="space-y-3"
        >
          <FormField
            control={form.control}
            name="species"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Species
                </FormLabel>
                <FormControl>
                  <AnnotationSelectMenu
                    label="Species"
                    options={Object.values(SPECIES_VISUAL_IDS)}
                    selectedValue={field.value}
                    onSelect={handleSpeciesSelect}
                    isInvalid={!!fieldState.error && speciesEnabled}
                    disabled={!speciesEnabled}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Sex
                </FormLabel>
                <FormControl>
                  <AnnotationSelectMenu
                    label="Sex"
                    options={Object.values(SEX_VISUAL_IDS)}
                    selectedValue={field.value}
                    onSelect={handleSexSelect}
                    isInvalid={!!fieldState.error && sexEnabled}
                    disabled={!sexEnabled}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="abdomenStatus"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Abdomen Status
                </FormLabel>
                <FormControl>
                  <AnnotationSelectMenu
                    label="Abdomen Status"
                    options={Object.values(ABDOMEN_STATUS_VISUAL_IDS)}
                    selectedValue={field.value}
                    onSelect={handleAbdomenStatusSelect}
                    isInvalid={!!fieldState.error && abdomenStatusEnabled}
                    disabled={!abdomenStatusEnabled}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="artifact"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Artifact
                  {isFlagged && (
                    <span className="text-destructive ml-1">(Required)*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <AnnotationSelectMenu
                    label="Artifact"
                    options={Object.values(ARTIFACT_VISUAL_IDS)}
                    selectedValue={field.value}
                    onSelect={handleArtifactSelect}
                    isInvalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {notesRequired && (
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                    Notes
                    <span className="text-destructive ml-1">(Required)*</span>
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
          )}

          <div className="flex gap-3 pt-2">
            <FormField
              control={form.control}
              name="flagged"
              render={({ field }) => (
                <Toggle
                  pressed={field.value}
                  onPressedChange={newFlagged =>
                    handleFlagged(newFlagged, field.onChange)
                  }
                  variant="outline"
                  disabled={updateAnnotationMutation.isPending}
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
              className="flex flex-1 items-center justify-center gap-1.5 bg-[#22c55e] text-white hover:bg-[#86efac]"
              disabled={updateAnnotationMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {updateAnnotationMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
