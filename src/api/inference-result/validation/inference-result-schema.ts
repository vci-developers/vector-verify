import { z } from 'zod';

export const inferenceResultSchema = z.object({
    id: z.number(),
    bboxTopLeftX: z.number(),
    bboxTopLeftY: z.number(),
    bboxWidth: z.number(),
    bboxHeight: z.number(),
    bboxConfidence: z.number(),
    bboxClassId: z.number(),
    bboxDetectionDuration: z.number().nullable(),
    speciesLogits: z.array(z.number()),
    speciesInferenceDuration: z.number().nullable(),
    sexLogits: z.array(z.number()),
    sexInferenceDuration: z.number().nullable(),
    abdomenStatusLogits: z.array(z.number()),
    abdomenStatusInferenceDuration: z.number().nullable(),
})

export type InferenceResult = z.infer<typeof inferenceResultSchema>;
