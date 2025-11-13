'use client';

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
  MorphIdentificationFormInput,
  morphIdentificationFormSchema,
  isAbdomenStatusEnabled,
  isSexEnabled,
} from './validation/morph-identification-form-schema';
import { toDomId } from '@/shared/core/utils/dom';
import { AnnotationSelectMenu } from './annotation-select-menu';
import {
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
} from '@/shared/entities/specimen/morph-ids';
import { Checkbox } from '@/ui/checkbox';
import { useEffect, useImperativeHandle, forwardRef } from 'react';

export interface MorphIdentificationFormRef {
  validate: () => Promise<boolean>;
}

interface MorphIdentificationFormProps {
  defaultValues: {
    received?: boolean;
    species?: string;
    sex?: string;
    abdomenStatus?: string;
  };
  onValuesChange?: (values: {
    received: boolean;
    species?: string;
    sex?: string;
    abdomenStatus?: string;
  }) => void;
}

export const MorphIdentificationForm = forwardRef<
  MorphIdentificationFormRef,
  MorphIdentificationFormProps
>(({ defaultValues, onValuesChange }, ref) => {
  const morphForm = useForm<MorphIdentificationFormInput>({
    resolver: zodResolver(morphIdentificationFormSchema),
    defaultValues: {
      received: defaultValues?.received ?? false,
      species: defaultValues?.received
        ? (defaultValues?.species ?? undefined)
        : undefined,
      sex: defaultValues?.received
        ? (defaultValues?.sex ?? undefined)
        : undefined,
      abdomenStatus: defaultValues?.received
        ? (defaultValues?.abdomenStatus ?? undefined)
        : undefined,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const received = morphForm.watch('received') ?? false;
  const selectedSpecies = morphForm.watch('species');
  const selectedSex = morphForm.watch('sex');
  const selectedAbdomenStatus = morphForm.watch('abdomenStatus');

  useEffect(() => {
    onValuesChange?.({
      received,
      species: selectedSpecies,
      sex: selectedSex,
      abdomenStatus: selectedAbdomenStatus,
    });
  }, [
    received,
    selectedSpecies,
    selectedSex,
    selectedAbdomenStatus,
    onValuesChange,
  ]);

  const sexEnabled = received && isSexEnabled(selectedSpecies);
  const abdomenStatusEnabled =
    received && isAbdomenStatusEnabled(selectedSpecies, selectedSex);

  const handleReceivedChange = (checked: boolean) => {
    morphForm.setValue('received', checked, {
      shouldDirty: true,
      shouldValidate: false,
    });

    if (!checked) {
      morphForm.setValue('species', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.setValue('sex', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.setValue('abdomenStatus', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.clearErrors(['species', 'sex', 'abdomenStatus', 'received']);
    }
  };

  const handleSpeciesSelect = (newSpecies?: string) => {
    morphForm.setValue('species', newSpecies, {
      shouldDirty: true,
      shouldValidate: false,
    });

    if (!isSexEnabled(newSpecies)) {
      morphForm.setValue('sex', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.setValue('abdomenStatus', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.clearErrors(['sex', 'abdomenStatus']);
    }
    morphForm.clearErrors('species');
  };

  const handleSexSelect = (newSex?: string) => {
    morphForm.setValue('sex', newSex, {
      shouldDirty: true,
      shouldValidate: false,
    });

    if (!isAbdomenStatusEnabled(selectedSpecies, newSex)) {
      morphForm.setValue('abdomenStatus', undefined, {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.clearErrors(['abdomenStatus']);
    }
    morphForm.clearErrors('sex');
  };

  const handleAbdomenStatusSelect = (newAbdomenStatus?: string) => {
    morphForm.setValue('abdomenStatus', newAbdomenStatus, {
      shouldDirty: true,
      shouldValidate: false,
    });
    morphForm.clearErrors('abdomenStatus');
  };

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await morphForm.trigger();
      return isValid;
    },
  }));

  return (
    <Form {...morphForm}>
      <form className="space-y-3">
        <fieldset className="space-y-3">
          <FormField
            control={morphForm.control}
            name="received"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={checked =>
                      handleReceivedChange(checked === true)
                    }
                    id={toDomId('received')}
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel
                    htmlFor={toDomId('received')}
                    className="cursor-pointer font-normal"
                  >
                    Did you receive the specimen for morphological
                    identification?
                  </FormLabel>
                  <FormMessage className="text-xs" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={morphForm.control}
            name="species"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Species
                </FormLabel>
                <FormControl>
                  <AnnotationSelectMenu
                    label="species"
                    options={Object.values(SPECIES_MORPH_IDS)}
                    selectedValue={field.value}
                    onSelect={handleSpeciesSelect}
                    isInvalid={!!fieldState.error && received}
                    disabled={!received}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={morphForm.control}
            name="sex"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Sex
                </FormLabel>
                <FormControl>
                  <AnnotationSelectMenu
                    label="Sex"
                    options={Object.values(SEX_MORPH_IDS)}
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
            control={morphForm.control}
            name="abdomenStatus"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Abdomen Status
                </FormLabel>
                <FormControl>
                  <AnnotationSelectMenu
                    label="Abdomen Status"
                    options={Object.values(ABDOMEN_STATUS_MORPH_IDS)}
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
        </fieldset>
      </form>
    </Form>
  );
});

MorphIdentificationForm.displayName = 'MorphIdentificationForm';
