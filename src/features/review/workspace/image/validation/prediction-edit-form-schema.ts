import {
    abdomenStatusSchema,
    anophelesSpeciesSchema,
    genusSchema,
    sexSchema,
} from '@/api/specimen-image/validation/specimen-image-schema';
import { z } from 'zod';

export const predictionEditFormSchema = z
    .object({
        genus: genusSchema.exclude(['Unknown']).optional(),
        anophelesSpecies: anophelesSpeciesSchema
            .exclude(['unknown'])
            .optional(),
        sex: sexSchema.exclude(['Unknown']).optional(),
        abdomenStatus: abdomenStatusSchema.exclude(['Unknown']).optional(),
    })
    .superRefine((data, context) => {
        const { genus, anophelesSpecies, sex, abdomenStatus } = data;

        if (!genus) {
            context.addIssue({
                path: ['genus'],
                code: 'custom',
                message: 'Genus is required.',
            });
        }
        if (genus === 'Anopheles' && !anophelesSpecies) {
            context.addIssue({
                path: ['anophelesSpecies'],
                code: 'custom',
                message: 'Species is required for Anopheles genus.',
            });
        }
        if (genus !== 'Non-Mosquito' && !sex) {
            context.addIssue({
                path: ['sex'],
                code: 'custom',
                message: 'Sex is required.',
            });
        }
        if (genus !== 'Non-Mosquito' && sex !== 'Male' && !abdomenStatus) {
            context.addIssue({
                path: ['abdomenStatus'],
                code: 'custom',
                message: 'Abdomen status is required.',
            });
        }
    });

export type PredictionEditFormInput = z.infer<typeof predictionEditFormSchema>;
