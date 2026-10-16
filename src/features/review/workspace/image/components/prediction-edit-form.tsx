'use client';

import { reviewLogKeys } from '@/api/review-log/review-log-keys';
import { specimenKeys } from '@/api/specimen/specimen-keys';
import { usePutSpecimenImageDataById } from '@/api/specimen-image/hooks/use-put-specimen-image-data-by-id';
import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import PredictionSelectField from '@/features/review/workspace/image/components/prediction-select-field';
import {
    editableAbdomenStatusSchema,
    editableAnophelesSpeciesSchema,
    editableGenusSchema,
    editableSexSchema,
    predictionEditFormSchema,
    type PredictionEditFormInput,
} from '@/features/review/workspace/image/validation/prediction-edit-form-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PredictionEditFormProps {
    specimenId: number;
    image: SpecimenImage;
    onClose: () => void;
}

export default function PredictionEditForm({
    specimenId,
    image,
    onClose,
}: PredictionEditFormProps) {
    const t = useTranslations('ReviewImage');
    const tCommon = useTranslations('Common');
    const queryClient = useQueryClient();
    const { mutateAsync: putSpecimenImageDataAsync, isPending } =
        usePutSpecimenImageDataById();

    const [genus, anophelesSpecies] = image.species?.split(' ') ?? [];
    const predictionEditForm = useForm<PredictionEditFormInput>({
        resolver: zodResolver(predictionEditFormSchema),
        defaultValues: {
            genus: editableGenusSchema.safeParse(genus).data,
            anophelesSpecies:
                editableAnophelesSpeciesSchema.safeParse(anophelesSpecies).data,
            sex: editableSexSchema.safeParse(image.sex).data,
            abdomenStatus: editableAbdomenStatusSchema.safeParse(
                image.abdomenStatus,
            ).data,
        },
    });

    const watchGenus = predictionEditForm.watch('genus');
    const watchSex = predictionEditForm.watch('sex');

    const isNonMosquito = watchGenus === 'Non-Mosquito';
    const isAnopheles = watchGenus === 'Anopheles';
    const isMale = watchSex === 'Male';

    function handleGenusChange(
        value: NonNullable<PredictionEditFormInput['genus']>,
    ) {
        predictionEditForm.setValue('genus', value);
        predictionEditForm.setValue('anophelesSpecies', undefined);
        predictionEditForm.setValue('sex', undefined);
        predictionEditForm.setValue('abdomenStatus', undefined);
        predictionEditForm.clearErrors();
    }

    function handleSexChange(
        value: NonNullable<PredictionEditFormInput['sex']>,
    ) {
        predictionEditForm.setValue('sex', value);
        predictionEditForm.setValue('abdomenStatus', undefined);
        predictionEditForm.clearErrors(['sex', 'abdomenStatus']);
    }

    async function handleFormSubmit(formInput: PredictionEditFormInput) {
        if (!formInput.genus) return;

        const result = await putSpecimenImageDataAsync({
            specimenId,
            imageId: image.id,
            requestBody: {
                species:
                    formInput.genus === 'Anopheles'
                        ? `Anopheles ${formInput.anophelesSpecies}`
                        : formInput.genus,
                sex: isNonMosquito ? null : (formInput.sex ?? null),
                abdomenStatus:
                    isNonMosquito || isMale
                        ? null
                        : (formInput.abdomenStatus ?? null),
            },
        });

        if (!result.ok) {
            toast.error(t('editError'));
            return;
        }

        toast.success(t('editSuccess'));
        queryClient.invalidateQueries({ queryKey: specimenKeys.root });
        queryClient.invalidateQueries({ queryKey: reviewLogKeys.root });
        onClose();
    }

    return (
        <form
            onSubmit={predictionEditForm.handleSubmit(handleFormSubmit)}
            className="space-y-4"
        >
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="genus"
                        control={predictionEditForm.control}
                        render={({ field, fieldState }) => (
                            <PredictionSelectField
                                id="prediction-edit-genus"
                                label={t('genus')}
                                options={editableGenusSchema.options}
                                value={field.value}
                                onValueChange={handleGenusChange}
                                isApplicable
                                error={fieldState.error}
                            />
                        )}
                    />

                    <Controller
                        name="anophelesSpecies"
                        control={predictionEditForm.control}
                        render={({ field, fieldState }) => (
                            <PredictionSelectField
                                id="prediction-edit-species"
                                label={t('species')}
                                options={editableAnophelesSpeciesSchema.options}
                                value={field.value}
                                onValueChange={field.onChange}
                                isApplicable={isAnopheles}
                                error={fieldState.error}
                            />
                        )}
                    />

                    <Controller
                        name="sex"
                        control={predictionEditForm.control}
                        render={({ field, fieldState }) => (
                            <PredictionSelectField
                                id="prediction-edit-sex"
                                label={t('sex')}
                                options={editableSexSchema.options}
                                value={field.value}
                                onValueChange={handleSexChange}
                                isApplicable={!isNonMosquito}
                                error={fieldState.error}
                            />
                        )}
                    />

                    <Controller
                        name="abdomenStatus"
                        control={predictionEditForm.control}
                        render={({ field, fieldState }) => (
                            <PredictionSelectField
                                id="prediction-edit-abdomen-status"
                                label={t('abdomenStatus')}
                                options={editableAbdomenStatusSchema.options}
                                value={field.value}
                                onValueChange={field.onChange}
                                isApplicable={!isNonMosquito && !isMale}
                                error={fieldState.error}
                            />
                        )}
                    />
                </div>
            </FieldGroup>

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    disabled={isPending}
                >
                    {tCommon('cancel')}
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? tCommon('saving') : tCommon('save')}
                </Button>
            </div>
        </form>
    );
}
