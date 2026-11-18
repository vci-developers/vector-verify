'use client';

import { reviewLogKeys } from '@/api/review-log/review-log-keys';
import { usePutSpecimenById } from '@/api/specimen/hooks/use-put-specimen-by-id';
import { specimenKeys } from '@/api/specimen/specimen-keys';
import {
    putSpecimenByIdRequestSchema,
    type PutSpecimenByIdRequestBody,
} from '@/api/specimen/validation/put-specimen-by-id-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'sonner';

interface SpecimenIdEditFormProps {
    specimen: Specimen;
    canSave: boolean;
    onClose: () => void;
}

export default function SpecimenIdEditForm({
    specimen,
    canSave,
    onClose,
}: SpecimenIdEditFormProps) {
    const t = useTranslations('ReviewImage');
    const tCommon = useTranslations('Common');
    const queryClient = useQueryClient();
    const { mutate: putSpecimen, isPending } = usePutSpecimenById();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const isSaving = isPending || isRefreshing;
    const form = useForm<PutSpecimenByIdRequestBody>({
        resolver: zodResolver(putSpecimenByIdRequestSchema),
        defaultValues: { specimenId: specimen.specimenId },
    });

    function handleSubmit(requestBody: PutSpecimenByIdRequestBody) {
        if (!canSave || isSaving) return;
        putSpecimen(
            { specimenId: specimen.id, requestBody },
            {
                onSuccess: async result => {
                    if (!result.ok) {
                        if (result.error.status === 409) {
                            form.setError('specimenId', {
                                type: 'server',
                                message: t('duplicateSpecimenId'),
                            });
                        } else {
                            toast.error(t('specimenIdEditError'));
                        }
                        return;
                    }

                    setIsRefreshing(true);
                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: specimenKeys.root,
                        }),
                        queryClient.invalidateQueries({
                            queryKey: reviewLogKeys.root,
                        }),
                    ]);
                    toast.success(t('specimenIdEditSuccess'));
                    onClose();
                },
                onError: () => toast.error(t('specimenIdEditError')),
            },
        );
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Controller
                name="specimenId"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="specimen-id-edit">
                            {t('specimenId')}
                        </FieldLabel>
                        <Input
                            {...field}
                            id="specimen-id-edit"
                            autoFocus
                            disabled={isSaving}
                            aria-invalid={fieldState.invalid}
                            aria-describedby={
                                fieldState.error
                                    ? 'specimen-id-error'
                                    : undefined
                            }
                            onChange={event => {
                                field.onChange(event);
                                form.clearErrors('specimenId');
                            }}
                        />
                        {fieldState.error && (
                            <FieldError id="specimen-id-error">
                                {fieldState.error.type === 'server'
                                    ? fieldState.error.message
                                    : t('specimenIdRequired')}
                            </FieldError>
                        )}
                    </Field>
                )}
            />
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={onClose}
                >
                    {tCommon('cancel')}
                </Button>
                <Button type="submit" disabled={!canSave || isSaving}>
                    {isSaving ? tCommon('saving') : tCommon('save')}
                </Button>
            </div>
        </form>
    );
}
