import { z } from 'zod';
import { sessionSchema } from '@/api/session/validation/session-schema';

export const getSessionsQueryParamsSchema = z.object({
    siteId: z.coerce.number().optional(),
    programId: z.coerce.number().optional(),
    district: z.string().optional(),
    deviceId: z.coerce.number().optional(),
    frontendId: z.string().optional(),
    collectorName: z.string().optional(),
    collectionMethod: z.string().optional(),
    specimenCondition: z.string().optional(),
    status: z.enum(['pending', 'completed', 'submitted']).optional(),
    type: z.enum(['SURVEILLANCE', 'DATA_COLLECTION']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    offset: z.coerce.number().min(0).optional(),
    sortBy: z
        .enum([
            'id',
            'frontendId',
            'createdAt',
            'completedAt',
            'submittedAt',
            'collectionDate',
        ])
        .optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const getSessionsResponseSchema = z.object({
    sessions: z.array(sessionSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export type GetSessionsQueryParams = z.infer<
    typeof getSessionsQueryParamsSchema
>;
export type GetSessionsResponseBody = z.infer<typeof getSessionsResponseSchema>;

export type GetSessionsSuccessPayload = GetSessionsResponseBody;
