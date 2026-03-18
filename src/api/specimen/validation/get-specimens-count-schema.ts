import { sessionTypeSchema } from '@/api/session/validation/session-schema';
import { siteSchema } from '@/api/site/validation/site-schema';
import { z } from 'zod';

export const getSpecimensCountQueryParamsSchema = z.object({
    sessionId: z.coerce.number().optional(),
    siteId: z.coerce.number().optional(),
    programId: z.coerce.number().optional(),
    district: z.string().optional(),
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

export const specimensCountSchema = z.object({
    species: z.string(),
    sex: z.string(),
    abdomenStatus: z.string(),
    count: z.number(),
    columnName: z.string(),
});

export const specimensCountDataSchema = z.object({
    siteId: z.number().optional(),
    siteInfo: siteSchema.optional(),
    counts: z.array(specimensCountSchema),
    totalSpecimens: z.number(),
});

export const getSpecimensCountResponseSchema = z.object({
    message: z.string(),
    columns: z.array(z.string()),
    data: z.array(specimensCountDataSchema),
});

export type GetSpecimensCountQueryParams = z.infer<
    typeof getSpecimensCountQueryParamsSchema
>;
export type GetSpecimensCountResponseBody = z.infer<
    typeof getSpecimensCountResponseSchema
>;
export type GetSpecimensCountSuccessPayload = GetSpecimensCountResponseBody;
