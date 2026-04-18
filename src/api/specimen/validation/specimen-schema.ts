import { z } from 'zod';
import { specimenImageSchema } from '@/api/specimen-image/validation/specimen-image-schema';
import { sessionSchema } from '@/api/session/validation/session-schema';

export const specimenSchema = z.object({
    id: z.number(),
    specimenId: z.string(),
    sessionId: z.number(),
    thumbnailUrl: z.string().nullable(),
    thumbnailImageId: z.number().nullable(),
    shouldProcessFurther: z.boolean().optional(),
    images: z.array(specimenImageSchema).optional(),
    expectedImages: z.number().optional(),
    thumbnailImage: specimenImageSchema.nullable(),
    session: sessionSchema.optional(),
});

export type Specimen = z.infer<typeof specimenSchema>;
export type SpecimenClassificationAxis = 'species' | 'sex' | 'abdomenStatus';
