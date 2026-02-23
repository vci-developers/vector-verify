import { z } from 'zod';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';

export const getSpecimensQueryParamsSchema = z.object({
    sessionId: z.coerce.number().optional(),
    siteId: z.coerce.number().optional(),
    programId: z.coerce.number().optional(),
    district: z.string().optional(),
    specimenId: z.string().optional(),
    shouldProcessFurther: z.coerce.boolean().optional(),
    hasImages: z.coerce.boolean().optional(),
    includeAllImages: z.coerce.boolean().optional(),
    species: z.string().optional(),
    sex: z.string().optional(),
    abdomenStatus: z.string().optional(),
    sessionType: z.enum(['SURVEILLANCE', 'DATA_COLLECTION']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    offset: z.coerce.number().min(0).optional(),
    sortBy: z.enum(['id', 'specimenId', 'capturedAt', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const getSpecimensSchema = z.object({
    specimens: z.array(specimenSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export type GetSpecimensQueryParams = z.infer<
    typeof getSpecimensQueryParamsSchema
>;
export type GetSpecimensResponseBody = z.infer<typeof getSpecimensSchema>;

export type GetSpecimensSuccessPayload = GetSpecimensResponseBody;
