import { z } from 'zod';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';

export const getSpecimenByIdResponseSchema = specimenSchema;

export type GetSpecimenByIdResponseBody = z.infer<
    typeof getSpecimenByIdResponseSchema
>;

export type GetSpecimenByIdSuccessPayload = GetSpecimenByIdResponseBody;
