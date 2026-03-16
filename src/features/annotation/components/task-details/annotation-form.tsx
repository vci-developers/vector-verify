'use client';

import type { Annotation } from '@/api/annotation/validation/annotation-schema';
import type { PutAnnotationByIdRequestBody } from '@/api/annotation/validation/put-annotation-by-id-schema';
import { Controller, useForm } from 'react-hook-form';
import {
    type AnnotationFormArtifact,
    annotationFormArtifactSchema,
    type AnnotationFormInput,
    annotationFormSchema,
} from '@/features/annotation/validation/annotation-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    abdomenStatusSchema,
    anophelesSpeciesSchema,
    genusSchema,
    sexSchema,
    type AbdomenStatus,
    type AnophelesSpecies,
    type Genus,
    type Sex,
} from '@/api/specimen-image/validation/specimen-image-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Flag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from '@/components/ui/multi-select';
import {
    deserializeAnnotationFormArtifacts,
    serializeAnnotationFormArtifacts,
} from '@/features/annotation/lib/annotation-form-artifacts-serializer';

interface AnnotationFormProps {
    annotation: Annotation;
    isSubmitting: boolean;
    onSubmit: (data: PutAnnotationByIdRequestBody) => void;
    onCancel?: () => void;
}

export default function AnnotationForm({
    annotation,
    isSubmitting,
    onSubmit,
    onCancel,
}: AnnotationFormProps) {
    const [genus, anophelesSpecies] =
        annotation.visualSpecies?.split(' ') ?? [];
    const annotationForm = useForm<AnnotationFormInput>({
        resolver: zodResolver(annotationFormSchema),
        defaultValues: {
            visualGenus: (genus as Genus) ?? undefined,
            visualAnophelesSpecies:
                (anophelesSpecies as AnophelesSpecies) ?? undefined,
            visualSex: (annotation.visualSex as Sex) ?? undefined,
            visualAbdomenStatus:
                (annotation.visualAbdomenStatus as AbdomenStatus) ?? undefined,
            artifacts: deserializeAnnotationFormArtifacts(annotation.artifacts),
            notes: annotation.notes ?? undefined,
            isFlagged: annotation.status === 'FLAGGED',
        },
    });

    const watchGenus = annotationForm.watch('visualGenus');
    const watchSex = annotationForm.watch('visualSex');
    const watchIsFlagged = annotationForm.watch('isFlagged');

    const isNonMosquito = watchGenus === 'Non mosquito';
    const isAnopheles = watchGenus === 'Anopheles';
    const isMale = watchSex === 'Male';

    function handleGenusChange(value: Genus) {
        annotationForm.setValue('visualGenus', value);
        annotationForm.setValue('visualAnophelesSpecies', undefined);
        annotationForm.setValue('visualSex', undefined);
        annotationForm.setValue('visualAbdomenStatus', undefined);
        annotationForm.clearErrors([
            'visualGenus',
            'visualAnophelesSpecies',
            'visualSex',
            'visualAbdomenStatus',
        ]);
    }

    function handleAnophelesSpeciesChange(value: AnophelesSpecies) {
        annotationForm.setValue('visualAnophelesSpecies', value);
        annotationForm.clearErrors(['visualAnophelesSpecies']);
    }

    function handleSexChange(value: Sex) {
        annotationForm.setValue('visualSex', value);
        annotationForm.setValue('visualAbdomenStatus', undefined);
        annotationForm.clearErrors(['visualSex', 'visualAbdomenStatus']);
    }

    function handleAbdomenStatusChange(value: AbdomenStatus) {
        annotationForm.setValue('visualAbdomenStatus', value);
        annotationForm.clearErrors(['visualAbdomenStatus']);
    }

    function handleArtifactSelected(values: string[]) {
        annotationForm.setValue(
            'artifacts',
            values as AnnotationFormArtifact[],
        );
        annotationForm.clearErrors('artifacts');
    }

    function handleIsFlaggedChange(value: boolean) {
        annotationForm.setValue('isFlagged', value);
        if (value) {
            annotationForm.clearErrors([
                'visualGenus',
                'visualAnophelesSpecies',
                'visualSex',
                'visualAbdomenStatus',
            ]);
        } else {
            annotationForm.clearErrors('artifacts');
            annotationForm.clearErrors('notes');
        }
    }

    function handleFormSubmit(formInput: AnnotationFormInput) {
        const visualSpecies =
            formInput.visualGenus === 'Anopheles' &&
            formInput.visualAnophelesSpecies
                ? `Anopheles ${formInput.visualAnophelesSpecies}`
                : formInput.visualGenus || undefined;

        onSubmit({
            visualSpecies,
            visualSex: formInput.visualSex,
            visualAbdomenStatus: formInput.visualAbdomenStatus,
            artifacts: serializeAnnotationFormArtifacts(formInput.artifacts),
            notes: formInput.notes,
            status: formInput.isFlagged ? 'FLAGGED' : 'ANNOTATED',
        });

        annotationForm.reset();
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                        {onCancel ? 'Edit Annotation' : 'New Annotation'}
                    </CardTitle>
                </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4">
                <form
                    id="annotation-rhf"
                    onSubmit={annotationForm.handleSubmit(handleFormSubmit)}
                    className="space-y-4"
                >
                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="visualGenus"
                                control={annotationForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="annotation-rhf-genus">
                                            Genus
                                            {!watchIsFlagged && (
                                                <span className="text-destructive">
                                                    (Required)
                                                </span>
                                            )}
                                        </FieldLabel>
                                        <Select
                                            onValueChange={handleGenusChange}
                                            value={field.value ?? ''}
                                        >
                                            <SelectTrigger id="annotation-rhf-genus">
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {genusSchema.options.map(
                                                    option => (
                                                        <SelectItem
                                                            key={option}
                                                            value={option}
                                                        >
                                                            {option}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="visualAnophelesSpecies"
                                control={annotationForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="annotation-rhf-species">
                                            Species
                                            {!watchIsFlagged && isAnopheles && (
                                                <span className="text-destructive">
                                                    (Required)
                                                </span>
                                            )}
                                        </FieldLabel>
                                        <Select
                                            disabled={!isAnopheles}
                                            onValueChange={
                                                handleAnophelesSpeciesChange
                                            }
                                            value={field.value ?? ''}
                                        >
                                            <SelectTrigger id="annotation-rhf-species">
                                                <SelectValue
                                                    placeholder={
                                                        isAnopheles
                                                            ? 'Select...'
                                                            : 'N/A'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {anophelesSpeciesSchema.options.map(
                                                    option => (
                                                        <SelectItem
                                                            key={option}
                                                            value={option}
                                                        >
                                                            {option}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="visualSex"
                                control={annotationForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="annotation-rhf-sex">
                                            Sex
                                            {!watchIsFlagged &&
                                                !isNonMosquito && (
                                                    <span className="text-destructive">
                                                        (Required)
                                                    </span>
                                                )}
                                        </FieldLabel>
                                        <Select
                                            disabled={isNonMosquito}
                                            onValueChange={handleSexChange}
                                            value={field.value ?? ''}
                                        >
                                            <SelectTrigger id="annotation-rhf-sex">
                                                <SelectValue
                                                    placeholder={
                                                        isNonMosquito
                                                            ? 'N/A'
                                                            : 'Select...'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sexSchema.options.map(
                                                    option => (
                                                        <SelectItem
                                                            key={option}
                                                            value={option}
                                                        >
                                                            {option}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="visualAbdomenStatus"
                                control={annotationForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="annotation-rhf-abdomen">
                                            Abdomen Status
                                            {!watchIsFlagged &&
                                                !isNonMosquito &&
                                                !isMale && (
                                                    <span className="text-destructive">
                                                        (Required)
                                                    </span>
                                                )}
                                        </FieldLabel>
                                        <Select
                                            disabled={isNonMosquito || isMale}
                                            onValueChange={
                                                handleAbdomenStatusChange
                                            }
                                            value={field.value ?? ''}
                                        >
                                            <SelectTrigger id="annotation-rhf-abdomen">
                                                <SelectValue
                                                    placeholder={
                                                        isNonMosquito || isMale
                                                            ? 'N/A'
                                                            : 'Select...'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {abdomenStatusSchema.options.map(
                                                    option => (
                                                        <SelectItem
                                                            key={option}
                                                            value={option}
                                                        >
                                                            {option}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            name="artifacts"
                            control={annotationForm.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="annotation-rhf-artifacts">
                                        Artifacts
                                        {watchIsFlagged && (
                                            <span className="text-destructive">
                                                (Required)
                                            </span>
                                        )}
                                    </FieldLabel>
                                    <MultiSelect
                                        values={field.value ?? []}
                                        onValuesChange={handleArtifactSelected}
                                    >
                                        <MultiSelectTrigger className="w-full">
                                            <MultiSelectValue placeholder="Select artifacts..." />
                                        </MultiSelectTrigger>
                                        <MultiSelectContent>
                                            {annotationFormArtifactSchema.options.map(
                                                option => (
                                                    <MultiSelectItem
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </MultiSelectItem>
                                                ),
                                            )}
                                        </MultiSelectContent>
                                    </MultiSelect>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="notes"
                            control={annotationForm.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="annotation-rhf-notes">
                                        Notes
                                        {watchIsFlagged && (
                                            <span className="text-destructive">
                                                (Required)
                                            </span>
                                        )}
                                    </FieldLabel>
                                    <Textarea
                                        {...field}
                                        id="annotation-rhf-notes"
                                        placeholder={
                                            watchIsFlagged
                                                ? 'Describe why this specimen is flagged...'
                                                : 'Any additional observations...'
                                        }
                                        className="h-24 resize-none"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="isFlagged"
                            control={annotationForm.control}
                            render={({ field }) => (
                                <Toggle
                                    variant="outline"
                                    pressed={field.value}
                                    onPressedChange={handleIsFlaggedChange}
                                    aria-label="Flag for review"
                                    className="data-[state=on]:border-destructive data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground w-full transition-colors duration-300 data-[state=on]:animate-pulse"
                                >
                                    <Flag className="mr-2 h-4 w-4" />
                                    {field.value ? "Specimen Flagged" : "Flag Specimen"}
                                </Toggle>
                            )}
                        />
                    </FieldGroup>

                    <div className="flex justify-end gap-2">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? 'Saving...'
                                : onCancel
                                  ? 'Save Changes'
                                  : 'Submit & Next'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
