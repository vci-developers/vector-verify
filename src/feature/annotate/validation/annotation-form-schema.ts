import { z } from "zod";

export const AnnotationBase = z.object({
  species: z.string().optional(),
  sex: z.string().optional(),
  abdomenStatus: z.string().optional(),
  notes: z.string().min(2).max(1000).optional(),
  flagged: z.boolean().default(false),
});

export const isSexEnabled = (species?: string) => species !== "Non Mosquito";
export const isAbdomenStatusEnabled = (species?: string, sex?: string) =>
  isSexEnabled(species) && sex !== "Male";

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

export type AnnotationFormInput  = z.input<typeof AnnotationFormSchema>;
export type AnnotationFormOutput = z.output<typeof AnnotationFormSchema>;
