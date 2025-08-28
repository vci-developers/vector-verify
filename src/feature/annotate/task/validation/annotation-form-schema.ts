import {
  AbdomenStatusLabels,
  SexLabels,
  SpeciesLabels,
} from "@/lib/domain/reference/labels";
import { z } from "zod";

const SPECIES_VALUES = Object.values(SpeciesLabels) as [string, ...string[]];
const SEX_VALUES = Object.values(SexLabels) as [string, ...string[]];
const ABDOMEN_STATUS_VALUES = Object.values(AbdomenStatusLabels) as [
  string,
  ...string[]
];

export const AnnotationBase = z.object({
  species: z.enum(SPECIES_VALUES).optional(),
  sex: z.enum(SEX_VALUES).optional(),
  abdomenStatus: z.enum(ABDOMEN_STATUS_VALUES).optional(),
  notes: z.string().optional(),
  flagged: z.boolean().default(false),
});

export const isSexEnabled = (species?: string) =>
  species !== SpeciesLabels.NON_MOSQUITO;
export const isAbdomenStatusEnabled = (species?: string, sex?: string) =>
  isSexEnabled(species) && sex !== SexLabels.MALE;

export const AnnotationFormSchema = AnnotationBase.superRefine(
  (formFields, context) => {
    if (formFields.flagged) {
      if (!formFields.notes || !formFields.notes.trim()) {
        context.addIssue({
          code: "custom",
          path: ["notes"],
          message: "Notes are required when the specimen is flagged.",
        });
      }
      return;
    }

    if (!formFields.species) {
      context.addIssue({
        code: "custom",
        path: ["species"],
        message: "Species is required when the specimen is not flagged.",
      });
    }

    if (isSexEnabled(formFields.species) && !formFields.sex) {
      context.addIssue({
        code: "custom",
        path: ["sex"],
        message: "Sex is required when the specimen is not flagged.",
      });
    }

    if (
      isAbdomenStatusEnabled(formFields.species, formFields.sex) &&
      !formFields.abdomenStatus
    ) {
      context.addIssue({
        code: "custom",
        path: ["abdomenStatus"],
        message: "Abdomen status is required when the specimen is not flagged.",
      });
    }
  }
);

export type AnnotationFormInput = z.input<typeof AnnotationFormSchema>;
export type AnnotationFormOutput = z.output<typeof AnnotationFormSchema>;
