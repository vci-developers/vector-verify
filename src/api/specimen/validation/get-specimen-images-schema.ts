import { z } from 'zod';
import { specimenImageSchema } from '@/api/specimen-image/validation/specimen-image-schema';
export const specimenImagesIdSchema = z.coerce.number().int().positive().safe();
export const getSpecimenImagesResponseSchema = z.object({
    images: z.array(specimenImageSchema),
    thumbnailUrl: z.string().nullable(),
    thumbnailImageId: z.number().nullable(),
});
export type GetSpecimenImagesResponse = z.infer<
    typeof getSpecimenImagesResponseSchema
>;
