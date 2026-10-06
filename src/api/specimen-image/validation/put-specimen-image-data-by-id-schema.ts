import { z } from 'zod';
import { specimenImageSchema } from '@/api/specimen-image/validation/specimen-image-schema';

export const putSpecimenImageDataByIdRequestSchema = z.object({
    species: z.string(),
    sex: z.string(),
    abdomenStatus: z.string(),
});

export const putSpecimenImageDataByIdResponseSchema = z.object({
    message: z.string(),
    image: specimenImageSchema,
});

export type PutSpecimenImageDataByIdRequestBody = z.infer<
    typeof putSpecimenImageDataByIdRequestSchema
>;
export type PutSpecimenImageDataByIdResponseBody = z.infer<
    typeof putSpecimenImageDataByIdResponseSchema
>;

export type PutSpecimenImageDataByIdSuccessPayload =
    PutSpecimenImageDataByIdResponseBody;
