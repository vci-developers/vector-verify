import {
  GENUS_MORPH_IDS,
  SPECIES_MORPH_IDS,
  SEX_MORPH_IDS,
  ABDOMEN_STATUS_MORPH_IDS,
  MORPH_ARTIFACTS,
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
const ARTIFACT_VALUES = Object.values(MORPH_ARTIFACTS) as [
  string,
  ...string[],
];

export const AnnotationBase = z.object({
  genus: z.string().optional(),
  species: z.string().optional(),
  sex: z.string().optional(),
  abdomenStatus: z.string().optional(),
  artifact: z.string().optional(),
  notes: z.string().optional(),
  flagged: z.boolean().default(false),
});

export const isSpeciesEnabled = (genus?: string) =>
  genus === GENUS_MORPH_IDS.ANOPHELES;

export const isSexEnabled = (genus?: string) =>
  genus !== GENUS_MORPH_IDS.NON_MOSQUITO && !!genus;

export const isAbdomenStatusEnabled = (genus?: string, sex?: string) =>
  isSexEnabled(genus) && sex === SEX_MORPH_IDS.FEMALE;

export const isNotesRequired = (artifact?: string) =>
  artifact === MORPH_ARTIFACTS.OTHER;

export const annotationFormSchema = AnnotationBase.superRefine(
  (formFields, context) => {
    if (isSpeciesEnabled(formFields.genus)) {
      if (!formFields.species || !SPECIES_VALUES.includes(formFields.species)) {
        context.addIssue({
          code: 'custom',
          path: ['species'],
          message: 'Species is required for Anopheles genus.',
        });
      }
    }
    
    if (formFields.flagged) {
      if (!formFields.artifact || !ARTIFACT_VALUES.includes(formFields.artifact)) {
        context.addIssue({
          code: 'custom',
          path: ['artifact'],
          message: 'Artifact is required when the specimen is flagged.',
        });
      }
      
      if (isNotesRequired(formFields.artifact) && !formFields.notes?.trim()) {
        context.addIssue({
          code: 'custom',
          path: ['notes'],
          message: 'Notes are required when artifact is "Other".',
        });
      }
      
      return;
    }

    if (!formFields.genus || !GENUS_VALUES.includes(formFields.genus)) {
      context.addIssue({
        code: 'custom',
        path: ['genus'],
        message: 'Genus is required when the specimen is not flagged.',
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
          message: 'Sex is required when the specimen is not flagged.',
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
      },
);

export type AnnotationFormInput = z.input<typeof annotationFormSchema>;
export type AnnotationFormOutput = z.output<typeof annotationFormSchema>;
