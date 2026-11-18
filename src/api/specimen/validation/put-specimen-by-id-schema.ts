import { z } from 'zod';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';

export const putSpecimenByIdParamsSchema = z.object({
    specimenId: z.coerce.number().int().positive(),
});

export const putSpecimenByIdRequestSchema = z.object({
    specimenId: z.string().trim().min(1),
});

export const putSpecimenByIdResponseSchema = z.object({
    message: z.string(),
    specimen: specimenSchema,
});

export type PutSpecimenByIdRequestBody = z.infer<
    typeof putSpecimenByIdRequestSchema
>;
export type PutSpecimenByIdSuccessPayload = z.infer<
    typeof putSpecimenByIdResponseSchema
>;
