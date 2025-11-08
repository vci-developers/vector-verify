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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { useEffect } from 'react';

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

export function MorphIdentificationForm({
  defaultValues,
  onValuesChange,
}: MorphIdentificationFormProps) {
  const morphForm = useForm<MorphIdentificationFormInput>({
    resolver: zodResolver(morphIdentificationFormSchema),
    defaultValues: {
      received: defaultValues?.received ?? false,
      species: defaultValues?.species ?? undefined,
      sex: defaultValues?.sex ?? undefined,
      abdomenStatus: defaultValues?.abdomenStatus ?? undefined,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const received = morphForm.watch('received') ?? false;
  const selectedSpecies = morphForm.watch('species');
  const selectedSex = morphForm.watch('sex');
  const abdomenStatus = morphForm.watch('abdomenStatus');

  useEffect(() => {
    onValuesChange?.({
      received,
      species: selectedSpecies,
      sex: selectedSex,
      abdomenStatus,
    });
  }, [received, selectedSpecies, selectedSex, abdomenStatus, onValuesChange]);

  const sexEnabled = received && isSexEnabled(selectedSpecies);
  const abdomenStatusEnabled =
    received && isAbdomenStatusEnabled(selectedSpecies, selectedSex);

  const handleReceivedChange = (value: string) => {
    const newReceived = value === 'yes';
    morphForm.setValue('received', newReceived, { shouldDirty: true });

    if (!newReceived) {
      morphForm.setValue('species', '', { shouldDirty: true });
      morphForm.setValue('sex', '', { shouldDirty: true });
      morphForm.setValue('abdomenStatus', '', { shouldDirty: true });
      morphForm.clearErrors(['species', 'sex', 'abdomenStatus']);
    }
    morphForm.clearErrors('received');
  };

  const handleSpeciesSelect = (newSpecies?: string) => {
    morphForm.setValue('species', newSpecies || '', { shouldDirty: true });

    if (!isSexEnabled(newSpecies)) {
      morphForm.setValue('sex', '', { shouldDirty: true });
      morphForm.setValue('abdomenStatus', '', { shouldDirty: true });
      morphForm.clearErrors(['sex', 'abdomenStatus']);
    }
    morphForm.clearErrors('species');
  };

  const handleSexSelect = (newSex?: string) => {
    morphForm.setValue('sex', newSex || '', { shouldDirty: true });

    if (!isAbdomenStatusEnabled(selectedSpecies, newSex)) {
      morphForm.setValue('abdomenStatus', '', { shouldDirty: true });
      morphForm.clearErrors(['abdomenStatus']);
    }
    morphForm.clearErrors('sex');
  };

  const handleAbdomenStatusSelect = (newAbdomenStatus?: string) => {
    morphForm.setValue('abdomenStatus', newAbdomenStatus || '', {
      shouldDirty: true,
    });
    morphForm.clearErrors('abdomenStatus');
  };

  return (
    <Form {...morphForm}>
      <form className="space-y-3">
        <fieldset className="space-y-3">
          <FormField
            control={morphForm.control}
            name="received"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel htmlFor={toDomId('received')} className="m-0">
                  Did you receive the specimen for morphological
                  identification?
                </FormLabel>
                <FormControl>
                  <Select
                    value={
                      field.value === undefined
                        ? ''
                        : field.value
                          ? 'yes'
                          : 'no'
                    }
                    onValueChange={handleReceivedChange}
                  >
                    <SelectTrigger
                      id={toDomId('received')}
                      className={
                        fieldState.error
                          ? 'border-destructive focus:border-destructive focus:ring-destructive'
                          : ''
                      }
                    >
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
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
}

