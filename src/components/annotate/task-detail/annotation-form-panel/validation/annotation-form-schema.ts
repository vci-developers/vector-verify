import {
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
} from '@/lib/entities/specimen/morph-ids';

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

export const AnnotationBase = z.object({
  species: z.string().optional(),
  sex: z.string().optional(),
  abdomenStatus: z.string().optional(),
  notes: z.string().optional(),
  flagged: z.boolean().default(false),
});
export const isSexEnabled = (species?: string) =>
  species !== SPECIES_MORPH_IDS.NON_MOSQUITO;
export const isAbdomenStatusEnabled = (species?: string, sex?: string) =>
  isSexEnabled(species) && sex !== SEX_MORPH_IDS.MALE;

export const annotationFormSchema = AnnotationBase.superRefine(
  (formFields, context) => {
    if (formFields.flagged) {
      if (!formFields.notes?.trim()) {
        context.addIssue({
          code: 'custom',
          path: ['notes'],
          message: 'Notes are required when the specimen is flagged.',
        });
      }
      return;
    }

    if (!formFields.species || !SPECIES_VALUES.includes(formFields.species)) {
      context.addIssue({
        code: 'custom',
        path: ['species'],
        message: 'Species is required when the specimen is not flagged.',
      });
      return;
    }

    if (isSexEnabled(formFields.species)) {
      if (!formFields.sex || !SEX_VALUES.includes(formFields.sex)) {
        context.addIssue({
          code: 'custom',
          path: ['sex'],
          message: 'Sex is required when the specimen is not flagged.',
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
          message:
            'Abdomen status is required when the specimen is not flagged.',
        });
      }
    }
  },
);

export type AnnotationFormInput = z.input<typeof annotationFormSchema>;
export type AnnotationFormOutput = z.output<typeof annotationFormSchema>;
