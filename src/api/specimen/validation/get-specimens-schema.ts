import { z } from 'zod';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { sessionTypeSchema } from '@/api/session/validation/session-schema';
import { booleanQueryParamSchema } from '@/lib/network/validation/boolean-query-param-schema';

export const getSpecimensQueryParamsSchema = z.object({
    sessionId: z.coerce.number().optional(),
    siteId: z.coerce.number().optional(),
    programId: z.coerce.number().optional(),
    collectionCycleId: z.coerce.number().optional(),
    district: z.string().optional(),
    specimenId: z.string().optional(),
    shouldProcessFurther: booleanQueryParamSchema().optional(),
    hasImages: booleanQueryParamSchema().optional(),
    includeAllImages: booleanQueryParamSchema().optional(),
    species: z.string().optional(),
    sex: z.string().optional(),
    abdomenStatus: z.string().optional(),
    sessionType: sessionTypeSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    offset: z.coerce.number().min(0).optional(),
    sortBy: z.enum(['id', 'specimenId', 'capturedAt', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const getSpecimensResponseSchema = z.object({
    specimens: z.array(specimenSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export type GetSpecimensQueryParams = z.infer<
    typeof getSpecimensQueryParamsSchema
>;
export type GetSpecimensResponseBody = z.infer<
    typeof getSpecimensResponseSchema
>;

export type GetSpecimensSuccessPayload = GetSpecimensResponseBody;
