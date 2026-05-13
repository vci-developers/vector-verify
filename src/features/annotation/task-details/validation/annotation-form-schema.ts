import {
    abdomenStatusSchema,
    anophelesSpeciesSchema,
    genusSchema,
    sexSchema,
} from '@/api/specimen-image/validation/specimen-image-schema';
import { z } from 'zod';

export const annotationFormArtifactSchema = z.enum([
    'Blurry Image',
    'Missing Specimen Parts',
    'Bad Specimen Pose',
    'Multiple Specimens Visible',
    'Other',
]);

export const annotationFormSchema = z
    .object({
        visualGenus: genusSchema.optional(),
        visualAnophelesSpecies: anophelesSpeciesSchema.optional(),
        visualSex: sexSchema.optional(),
        visualAbdomenStatus: abdomenStatusSchema.optional(),
        artifacts: z.array(annotationFormArtifactSchema).optional(),
        notes: z.string().optional(),
        isFlagged: z.boolean(),
    })
    .superRefine((data, context) => {
        const {
            visualGenus,
            visualAnophelesSpecies,
            visualSex,
            visualAbdomenStatus,
            artifacts,
            notes,
            isFlagged,
        } = data;

        if (!isFlagged) {
            if (!visualGenus) {
                context.addIssue({
                    path: ['visualGenus'],
                    code: 'custom',
                    message:
                        'Genus is required unless the specimen is flagged.',
                });
            }
            if (visualGenus === 'Anopheles' && !visualAnophelesSpecies) {
                context.addIssue({
                    path: ['visualAnophelesSpecies'],
                    code: 'custom',
                    message:
                        'Species is required for Anopheles genus unless the specimen is flagged.',
                });
            }
            if (visualGenus !== 'Non mosquito' && !visualSex) {
                context.addIssue({
                    path: ['visualSex'],
                    code: 'custom',
                    message: 'Sex is required unless the specimen is flagged.',
                });
            }
            if (
                visualGenus !== 'Non mosquito' &&
                visualSex !== 'Male' &&
                !visualAbdomenStatus
            ) {
                context.addIssue({
                    path: ['visualAbdomenStatus'],
                    code: 'custom',
                    message:
                        'Abdomen status is required unless the specimen is flagged.',
                });
            }
        }

        if (isFlagged) {
            if (!artifacts || artifacts.length === 0) {
                context.addIssue({
                    path: ['artifacts'],
                    code: 'custom',
                    message:
                        'At least one artifact is required if the specimen is flagged.',
                });
            }
            if (!notes?.trim()) {
                context.addIssue({
                    path: ['notes'],
                    code: 'custom',
                    message: 'Notes are required if the specimen is flagged.',
                });
            }
        }
    });

export type AnnotationFormInput = z.infer<typeof annotationFormSchema>;
export type AnnotationFormArtifact = z.infer<
    typeof annotationFormArtifactSchema
>;
