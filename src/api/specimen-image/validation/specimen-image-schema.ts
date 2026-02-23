import { z } from 'zod';
import { inferenceResultSchema } from '@/api/inference-result/validation/inference-result-schema';

export const specimenImageSchema = z.object({
    id: z.number(),
    url: z.string(),
    species: z.string().nullable(),
    sex: z.string().nullable(),
    abdomenStatus: z.string().nullable(),
    filemd5: z.string(),
    capturedAt: z.number(),
    submittedAt: z.number(),
    inferenceResult: inferenceResultSchema.nullable(),
});

export type SpecimenImage = z.infer<typeof specimenImageSchema>;
