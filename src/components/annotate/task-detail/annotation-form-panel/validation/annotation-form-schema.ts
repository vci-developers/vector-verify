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
  species: z.enum(SPECIES_VALUES).optional(),
  sex: z.enum(SEX_VALUES).optional(),
  abdomenStatus: z.enum(ABDOMEN_STATUS_VALUES).optional(),
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
      if (!formFields.notes || formFields.notes.trim().length === 0) {
        context.addIssue({
          code: 'custom',
          path: ['notes'],
          message: 'Notes are required when the specimen is flagged.',
        });
      }
      return;
    }
    if (!formFields.species) {
      context.addIssue({
        code: 'custom',
        path: ['species'],
        message: 'Species is required when the specimen is not flagged.',
      });
    }

    if (formFields.species === SPECIES_MORPH_IDS.NON_MOSQUITO) {
      return;
    }

    if (!formFields.sex) {
      context.addIssue({
        code: 'custom',
        path: ['sex'],
        message: 'Sex is required when the specimen is not flagged.',
      });
    }

    if (formFields.sex === SEX_MORPH_IDS.MALE) {
      return;
    }

    if (!formFields.abdomenStatus) {
      context.addIssue({
        code: 'custom',
        path: ['abdomenStatus'],
        message: 'Abdomen status is required when the specimen is not flagged.',
      });
    }
  },
);

export type AnnotationFormInput = z.input<typeof annotationFormSchema>;
export type AnnotationFormOutput = z.output<typeof annotationFormSchema>;
