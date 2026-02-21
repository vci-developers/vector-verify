import { z } from 'zod';
import { specimenImageSchema } from '../../specimen-image/validation/specimen-image-schema';
import { sessionSchema } from '../../session/validation/session-schema';

export const specimenSchema = z.object({
    id: z.number(),
    specimenId: z.string(),
    sessionId: z.number(),
    thumbnailUrl: z.string().nullable(),
    thumbnailImageId: z.string().nullable(),
    shouldProcessFurther: z.boolean(),
    images: z.array(specimenImageSchema),
    thumbnailImage: specimenImageSchema.nullable(),
    session: sessionSchema.optional()
})

export type Specimen = z.infer<typeof specimenSchema>;
