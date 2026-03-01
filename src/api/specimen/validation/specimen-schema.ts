import { z } from 'zod';
import { specimenImageSchema } from '@/api/specimen-image/validation/specimen-image-schema';
import { sessionSchema } from '@/api/session/validation/session-schema';

export const specimenSchema = z.object({
    id: z.number(),
    specimenId: z.string(),
    sessionId: z.number(),
    thumbnailUrl: z.string().nullable(),
    thumbnailImageId: z.string().nullable(),
    shouldProcessFurther: z.boolean(),
    images: z.array(specimenImageSchema),
    expectedImages: z.number(),
    thumbnailImage: specimenImageSchema.nullable(),
    session: sessionSchema.optional(),
});

export type Specimen = z.infer<typeof specimenSchema>;
