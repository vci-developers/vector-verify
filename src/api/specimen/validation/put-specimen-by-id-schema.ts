import { z } from 'zod';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { networkErrorSchema } from '@/lib/network/validation/network-error-schema';

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

export const putSpecimenByIdResultSchema = z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), data: putSpecimenByIdResponseSchema }),
    z.object({ ok: z.literal(false), error: networkErrorSchema }),
]);

export type PutSpecimenByIdResult = z.infer<typeof putSpecimenByIdResultSchema>;

export type PutSpecimenByIdRequestBody = z.infer<
    typeof putSpecimenByIdRequestSchema
>;
export type PutSpecimenByIdResponseBody = z.infer<
    typeof putSpecimenByIdResponseSchema
>;
