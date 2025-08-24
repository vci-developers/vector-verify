"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AnnotationFormSchema,
  type AnnotationFormInput,
  type AnnotationFormOutput,
  isSexEnabled,
  isAbdomenStatusEnabled,
} from "../../validation/annotation-form-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import MorphIdDropdownMenu from "../morph-id-dropdown-menu";
import {
  ABDOMEN_STATUS_LABELS,
  SEX_LABELS,
  SPECIES_LABELS,
} from "@/lib/labels";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Flag, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toDomId } from "@/lib/id-utils";

interface AnnotationFormProps {
  onSubmit: (values: AnnotationFormOutput) => Promise<void> | void;
  className?: string;
}

export default function AnnotationForm({
  onSubmit,
  className,
}: AnnotationFormProps) {
  const annotationForm = useForm<AnnotationFormInput>({
    resolver: zodResolver(AnnotationFormSchema),
    defaultValues: {
      species: undefined,
      sex: undefined,
      abdomenStatus: undefined,
      notes: undefined,
      flagged: false,
    },
    mode: "onSubmit",
  });

  const currentSpecies = annotationForm.watch("species");
  const currentSex = annotationForm.watch("sex");

  const sexEnabled = isSexEnabled(currentSpecies);
  const abdomenStatusEnabled = isAbdomenStatusEnabled(
    currentSpecies,
    currentSex
  );

  const currentFlagged = annotationForm.watch("flagged");

  const handleSpeciesSelect = (newSpecies?: string) => {
    annotationForm.setValue("species", newSpecies, { shouldDirty: true });
    if (!isSexEnabled(newSpecies)) {
      annotationForm.setValue("sex", undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      annotationForm.setValue("abdomenStatus", undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      annotationForm.clearErrors(["sex", "abdomenStatus"]);
    }
    annotationForm.clearErrors("species");
  };

  const handleSexSelect = (newSex?: string) => {
    annotationForm.setValue("sex", newSex, { shouldDirty: true });
    if (!isAbdomenStatusEnabled(currentSpecies, newSex)) {
      annotationForm.setValue("abdomenStatus", undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      annotationForm.clearErrors("abdomenStatus");
    }
    annotationForm.clearErrors("sex");
  };

  const handleAbdomenStatusSelect = (newAbdomenStatus?: string) => {
    annotationForm.setValue("abdomenStatus", newAbdomenStatus, {
      shouldDirty: true,
    });
    annotationForm.clearErrors("abdomenStatus");
  };

  const handleFlaggedChange = (
    newFlagged: boolean,
    updateFormValue: (value: boolean) => void
  ) => {
    updateFormValue(newFlagged);

    if (newFlagged) {
      annotationForm.clearErrors(["species", "sex", "abdomenStatus"]);
    } else {
      annotationForm.clearErrors("notes");
    }
  };

  const handleValidSubmit = (formInput: AnnotationFormInput) => {
    const validatedFormOutput = AnnotationFormSchema.parse(formInput);
    return onSubmit(validatedFormOutput);
  };

  return (
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
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)}>Species</FormLabel>
                <FormControl>
                  <MorphIdDropdownMenu
                    label="Species"
                    morphIds={SPECIES_LABELS}
                    selectedMorphId={field.value}
                    onMorphIdSelected={handleSpeciesSelect}
                    enabled
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={annotationForm.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)}>Sex</FormLabel>
                <FormControl>
                  <MorphIdDropdownMenu
                    label="Sex"
                    morphIds={SEX_LABELS}
                    selectedMorphId={field.value}
                    onMorphIdSelected={handleSexSelect}
                    enabled={sexEnabled}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={annotationForm.control}
            name="abdomenStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)}>
                  Abdomen Status
                </FormLabel>
                <FormControl>
                  <MorphIdDropdownMenu
                    label="Abdomen Status"
                    morphIds={ABDOMEN_STATUS_LABELS}
                    selectedMorphId={field.value}
                    onMorphIdSelected={handleAbdomenStatusSelect}
                    enabled={abdomenStatusEnabled}
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
                <FormLabel htmlFor={toDomId(field.name)}>
                  Notes{" "}
                  {currentFlagged && (
                    <span className="text-destructive">(Required)*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Textarea
                    id={toDomId(field.name)}
                    placeholder="Add observations..."
                    className="min-h-[80px] resize-none text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={annotationForm.control}
              name="flagged"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Toggle
                      pressed={!!field.value}
                      onPressedChange={(newFlagged) =>
                        handleFlaggedChange(newFlagged, field.onChange)
                      }
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-md border transition-colors",
                        "data-[state=on]:bg-destructive/10 data-[state=on]:text-destructive data-[state=on]:border-destructive data-[state=on]:hover:bg-destructive/20 motion-safe:data-[state=on]:animate-pulse",
                        "data-[state=off]:bg-background data-[state=off]:border-input data-[state=off]:hover:bg-accent data-[state=off]:hover:text-accent-foreground"
                      )}
                    >
                      <Flag
                        className={cn(
                          "h-4 w-4",
                          field.value
                            ? "text-destructive fill-current"
                            : "text-foreground"
                        )}
                      />
                      <span>
                        {field.value ? "Remove Flag" : "Flag Specimen"}
                      </span>
                    </Toggle>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={annotationForm.formState.isSubmitting}
              className="flex items-center justify-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              {annotationForm.formState.isSubmitting
                ? "Submitting..."
                : "Submit"}
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
