import { sessionTypeSchema } from '@/api/session/validation/session-schema';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { z } from 'zod';

export const getAllSpecimensQueryParamsSchema = z.object({
    sessionId: z.coerce.number().optional(),
    siteId: z.coerce.number().optional(),
    programId: z.coerce.number().optional(),
    district: z.string(),
    specimenId: z.string().optional(),
    shouldProcessFurther: z.coerce.boolean().optional(),
    hasImages: z.coerce.boolean().optional(),
    species: z.string().optional(),
    sex: z.string().optional(),
    abdomenStatus: z.string().optional(),
    sessionType: sessionTypeSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const getAllSpecimensResponseSchema = z.object({
    specimens: z.array(specimenSchema),
});

export type GetAllSpecimensQueryParams = z.infer<
    typeof getAllSpecimensQueryParamsSchema
>;
export type GetAllSpecimensResponseBody = z.infer<
    typeof getAllSpecimensResponseSchema
>;

export type GetAllSpecimensSuccessPayload = GetAllSpecimensResponseBody;
