import {
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
} from '@/shared/entities/specimen/morph-ids';

import { z } from 'zod';

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
  species: z.string().optional(),
  sex: z.string().optional(),
  abdomenStatus: z.string().optional(),
});

export const isSexEnabled = (species?: string) =>
  species !== SPECIES_MORPH_IDS.NON_MOSQUITO &&
  species !== SPECIES_MORPH_IDS.CANNOT_BE_DETERMINED;
export const isAbdomenStatusEnabled = (species?: string, sex?: string) =>
  isSexEnabled(species) && sex !== SEX_MORPH_IDS.MALE;

export const morphIdentificationFormSchema =
  MorphIdentificationBase.superRefine((formFields, context) => {
    if (!formFields.received) {
      return;
    }

    if (!formFields.species || !SPECIES_VALUES.includes(formFields.species)) {
      context.addIssue({
        code: 'custom',
        path: ['species'],
        message: 'Species is required when specimen is received.',
      });
    }

    if (isSexEnabled(formFields.species)) {
      if (!formFields.sex || !SEX_VALUES.includes(formFields.sex)) {
        context.addIssue({
          code: 'custom',
          path: ['sex'],
          message: 'Sex is required when specimen is received.',
        });
      }
    }

    if (isAbdomenStatusEnabled(formFields.species, formFields.sex)) {
      if (
        !formFields.abdomenStatus ||
        !ABDOMEN_STATUS_VALUES.includes(formFields.abdomenStatus)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['abdomenStatus'],
          message: 'Abdomen status is required when specimen is received.',
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
