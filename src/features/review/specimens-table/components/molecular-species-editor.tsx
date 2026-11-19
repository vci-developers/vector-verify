'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Check, Pencil, X } from 'lucide-react';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import { usePutSpecimenById } from '@/api/specimen/hooks/use-put-specimen-by-id';
import { specimenKeys } from '@/api/specimen/specimen-keys';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
    molecularSpeciesFormSchema,
    type MolecularSpeciesFormInput,
} from '@/features/review/specimens-table/validation/molecular-species-form-schema';

export default function MolecularSpeciesEditor({
    specimen,
}: {
    specimen: Specimen;
}) {
    const t = useTranslations('ReviewSpecimens');
    const tCommon = useTranslations('Common');
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const { mutateAsync: putSpecimenByIdAsync } = usePutSpecimenById();
    const molecularSpeciesForm = useForm<MolecularSpeciesFormInput>({
        resolver: zodResolver(molecularSpeciesFormSchema),
        defaultValues: { molecularSpecies: specimen.molecularSpecies ?? '' },
    });
    const isSaving = molecularSpeciesForm.formState.isSubmitting;
    const isMolecularSpeciesInvalid =
        molecularSpeciesForm.formState.errors.molecularSpecies !== undefined;
    const editLabel = t('editMolecularSpecies', {
        specimenId: specimen.specimenId,
    });

    function handleEdit() {
        molecularSpeciesForm.reset({
            molecularSpecies: specimen.molecularSpecies ?? '',
        });
        setIsEditing(true);
    }

    async function handleSave({ molecularSpecies }: MolecularSpeciesFormInput) {
        const putSpecimenByIdResult = await putSpecimenByIdAsync({
            specimenId: specimen.id,
            requestBody: { molecularSpecies: molecularSpecies || null },
        });
        if (!putSpecimenByIdResult.ok) {
            toast.error(t('molecularSpeciesSaveError'));
            return;
        }
        await queryClient.invalidateQueries({ queryKey: specimenKeys.root });
        toast.success(t('molecularSpeciesSaveSuccess'));
        setIsEditing(false);
    }

    // TODO: remove edit function once Kenya is taken off read-only, read-only views should not be able to add lab results
    if (!isEditing) {
        return (
            <span className="inline-flex items-center gap-1">
                {specimen.molecularSpecies || '—'}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={editLabel}
                    onClick={handleEdit}
                >
                    <Pencil className="size-4" aria-hidden="true" />
                </Button>
            </span>
        );
    }

    return (
        <form
            onSubmit={molecularSpeciesForm.handleSubmit(handleSave)}
            className="relative mx-auto w-40"
        >
            <Field data-invalid={isMolecularSpeciesInvalid}>
                <Input
                    aria-label={editLabel}
                    aria-invalid={isMolecularSpeciesInvalid}
                    autoFocus
                    disabled={isSaving}
                    className="h-8 pr-14 text-left"
                    {...molecularSpeciesForm.register('molecularSpecies')}
                />
                {isMolecularSpeciesInvalid && (
                    <FieldError
                        errors={[{ message: t('molecularSpeciesTooLong') }]}
                    />
                )}
            </Field>
            <div className="absolute top-1 right-1 flex">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={tCommon('cancel')}
                    disabled={isSaving}
                    onClick={() => setIsEditing(false)}
                >
                    <X aria-hidden="true" />
                </Button>
                <Button
                    type="submit"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={isSaving ? tCommon('saving') : tCommon('save')}
                    disabled={isSaving}
                >
                    {isSaving ? <Spinner /> : <Check aria-hidden="true" />}
                </Button>
            </div>
        </form>
    );
}
