import { z } from 'zod';
import { inferenceResultSchema } from '@/api/inference-result/validation/inference-result-schema';

export const genusSchema = z.enum([
    'Anopheles',
    'Aedes',
    'Culex',
    'Mansonia',
    'Non mosquito',
    'Unknown',
]);

export const anophelesSpeciesSchema = z.enum([
    'gambiae',
    'funestus',
    'other',
    'unknown',
]);

export const sexSchema = z.enum(['Female', 'Male', 'Unknown']);

export const abdomenStatusSchema = z.enum([
    'Unfed',
    'Fully fed',
    'Gravid',
    'Unknown',
]);

export const specimenImageSchema = z.object({
    id: z.number(),
    url: z.string(),
    species: z.string().nullable(),
    sex: z.string().nullable(),
    abdomenStatus: z.string().nullable(),
    filemd5: z.string().optional(),
    capturedAt: z.number().optional(),
    submittedAt: z.number().optional(),
    inferenceResult: inferenceResultSchema.nullable().optional(),
});

export type SpecimenImage = z.infer<typeof specimenImageSchema>;
export type Genus = z.infer<typeof genusSchema>;
export type AnophelesSpecies = z.infer<typeof anophelesSpeciesSchema>;
export type Sex = z.infer<typeof sexSchema>;
export type AbdomenStatus = z.infer<typeof abdomenStatusSchema>;