import { z } from 'zod';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';

export const getSpecimenByIdSchema = specimenSchema;

export type GetSpecimenByIdResponseBody = z.infer<typeof getSpecimenByIdSchema>;

export type GetSpecimenByIdSuccessPayload = GetSpecimenByIdResponseBody;
