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
  isSpeciesEnabled,
} from './validation/morph-identification-form-schema';
import { toDomId } from '@/shared/core/utils/dom';
import { AnnotationSelectMenu } from './annotation-select-menu';
import {
  GENUS_MORPH_IDS,
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
} from '@/shared/entities/specimen/morph-ids';
import { Checkbox } from '@/ui/checkbox';
import { useImperativeHandle, forwardRef, useMemo } from 'react';

export interface MorphIdentificationFormRef {
  validate: () => Promise<boolean>;
  getValues: () => any;
}

interface MorphIdentificationFormProps {
  defaultValues: {
    received?: boolean;
    genus?: string;
    species?: string;
    sex?: string;
    abdomenStatus?: string;
  };
}

export const MorphIdentificationForm = forwardRef<
  MorphIdentificationFormRef,
  MorphIdentificationFormProps
>(({ defaultValues }, ref) => {
  const computedDefaultValues = useMemo(
    () => ({
      received: defaultValues?.received ?? false,
      genus: defaultValues?.received ? (defaultValues?.genus ?? '') : '',
      species: defaultValues?.received ? (defaultValues?.species ?? '') : '',
      sex: defaultValues?.received ? (defaultValues?.sex ?? '') : '',
      abdomenStatus: defaultValues?.received
        ? (defaultValues?.abdomenStatus ?? '')
        : '',
    }),
    [
      defaultValues?.received,
      defaultValues?.genus,
      defaultValues?.species,
      defaultValues?.sex,
      defaultValues?.abdomenStatus,
    ],
  );

  const morphForm = useForm<MorphIdentificationFormInput>({
    resolver: zodResolver(morphIdentificationFormSchema),
    defaultValues: computedDefaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const received = morphForm.watch('received') ?? false;
  const selectedGenus = morphForm.watch('genus');
  const selectedSex = morphForm.watch('sex');

  const speciesEnabled = received && isSpeciesEnabled(selectedGenus);
  const sexEnabled = received && selectedGenus !== '' && isSexEnabled(selectedGenus);
  const abdomenStatusEnabled =
    received &&
    selectedGenus !== '' &&
    selectedSex !== '' &&
    isAbdomenStatusEnabled(selectedGenus, selectedSex);

  const handleReceivedChange = (checked: boolean) => {
    morphForm.setValue('received', checked, {
      shouldDirty: true,
      shouldValidate: false,
    });

    if (!checked) {
      morphForm.setValue('species', '', {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.setValue('genus', '', {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.setValue('sex', '', {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.setValue('abdomenStatus', '', {
        shouldDirty: true,
        shouldValidate: false,
      });
      morphForm.clearErrors(['species', 'sex', 'abdomenStatus', 'received', 'genus']);
    }
  };

  const setFormValue = (
    field: 'species' | 'sex' | 'abdomenStatus' | 'genus',
    value: string | undefined,
  ) => {
    morphForm.setValue(field, value ?? '', {
      shouldDirty: true,
      shouldValidate: false,
      shouldTouch: true,
    });
  };

  const handleGenusSelect = (newGenus?: string) => {
    setFormValue('genus', newGenus);

    if (!isSpeciesEnabled(newGenus)) {
      setFormValue('species', undefined);
      morphForm.clearErrors(['species']);
    }

    if (!isSexEnabled(newGenus)) {
      setFormValue('sex', undefined);
      setFormValue('abdomenStatus', undefined);
      morphForm.clearErrors(['sex', 'abdomenStatus']);
    }

    morphForm.clearErrors('genus');
  };

  const handleSpeciesSelect = (newSpecies?: string) => {
    setFormValue('species', newSpecies);
    morphForm.clearErrors('species');
  };

  const handleSexSelect = (newSex?: string) => {
    setFormValue('sex', newSex);

    if (!newSex || !isAbdomenStatusEnabled(selectedGenus, newSex)) {
      setFormValue('abdomenStatus', undefined);
      morphForm.clearErrors(['abdomenStatus']);
    }
    morphForm.clearErrors('sex');
  };

  const handleAbdomenStatusSelect = (newAbdomenStatus?: string) => {
    setFormValue('abdomenStatus', newAbdomenStatus);
    morphForm.clearErrors('abdomenStatus');
  };

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const isValid = await morphForm.trigger();
      return isValid;
    },
    getValues: () => {
      return morphForm.getValues();
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
            name="genus"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId(field.name)} className="m-0">
                  Genus
                </FormLabel>
                <FormControl>
                  <AnnotationSelectMenu
                    label="Genus"
                    options={Object.values(GENUS_MORPH_IDS)}
                    selectedValue={field.value}
                    onSelect={handleGenusSelect}
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
                    isInvalid={!!fieldState.error && speciesEnabled}
                    disabled={!speciesEnabled}
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
