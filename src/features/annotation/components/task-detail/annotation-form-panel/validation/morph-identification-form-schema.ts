import {
  GENUS_MORPH_IDS,
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
} from '@/shared/entities/specimen/morph-ids';

import { z } from 'zod';

const GENUS_VALUES = Object.values(GENUS_MORPH_IDS) as [string, ...string[]];
const SPECIES_VALUES = Object.values(SPECIES_MORPH_IDS) as [
  string,
  ...string[],
];
const SEX_VALUES = Object.values(SEX_MORPH_IDS) as [string, ...string[]];
const ABDOMEN_STATUS_VALUES = Object.values(ABDOMEN_STATUS_MORPH_IDS) as [
  string,
  ...string[],
];

export const MorphIdentificationBase = z.object({
  received: z.boolean().default(false),
  genus: z.string().optional(),
  species: z.string().optional(),
  sex: z.string().optional(),
  abdomenStatus: z.string().optional(),
});

export const isSpeciesEnabled = (genus?: string) =>
  genus === GENUS_MORPH_IDS.ANOPHELES;

export const isSexEnabled = (genus?: string) =>
  genus !== GENUS_MORPH_IDS.NON_MOSQUITO;

export const isAbdomenStatusEnabled = (genus?: string, sex?: string) =>
  isSexEnabled(genus) && sex !== SEX_MORPH_IDS.MALE;

export const morphIdentificationFormSchema =
  MorphIdentificationBase.superRefine((formFields, context) => {
    if (!formFields.received) {
      return;
    }

    if (!formFields.genus || !GENUS_VALUES.includes(formFields.genus)) {
      context.addIssue({
        code: 'custom',
        path: ['genus'],
        message: 'Genus is required when specimen is received.',
      });
    }

    if (isSpeciesEnabled(formFields.genus)) {
      if (!formFields.species || !SPECIES_VALUES.includes(formFields.species)) {
        context.addIssue({
          code: 'custom',
          path: ['species'],
          message: 'Species is required for Anopheles genus.',
        });
      }
    }

    if (isSexEnabled(formFields.genus)) {
      if (!formFields.sex || !SEX_VALUES.includes(formFields.sex)) {
        context.addIssue({
          code: 'custom',
          path: ['sex'],
          message: 'Sex is required when specimen is received.',
        });
      }
    }

    if (isAbdomenStatusEnabled(formFields.genus, formFields.sex)) {
      if (
        !formFields.abdomenStatus ||
        !ABDOMEN_STATUS_VALUES.includes(formFields.abdomenStatus)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['abdomenStatus'],
          message: 'Abdomen status is required for female specimens.',
        });
      }
    }
  });

export type MorphIdentificationFormInput = z.input<
  typeof morphIdentificationFormSchema
>;
export type MorphIdentificationFormOutput = z.output<
  typeof morphIdentificationFormSchema
>;
