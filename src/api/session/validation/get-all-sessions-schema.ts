import { z } from 'zod';
import {
    sessionSchema,
    sessionStateSchema,
    sessionTypeSchema,
} from '@/api/session/validation/session-schema';
import { arrayQueryParamSchema } from '@/lib/network/validation/array-query-param-schema';

export const getAllSessionsQueryParamsSchema = z
    .object({
        district: z.string().optional(),
        siteIds: arrayQueryParamSchema.optional(),
        programId: z.coerce.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        collectionCycleId: z.coerce.number().optional(),
        state: sessionStateSchema.optional(),
        type: sessionTypeSchema.optional(),
    })
    .refine(
        queryParams =>
            queryParams.district !== undefined ||
            queryParams.programId !== undefined ||
            (queryParams.siteIds !== undefined &&
                queryParams.siteIds.length > 0),
        {
            message: 'Either district, siteIds, or programId must be provided',
        },
    );

export const getAllSessionsResponseSchema = z.object({
    message: z.string(),
    sessions: z.array(sessionSchema),
});

export type GetAllSessionsQueryParams = z.infer<
    typeof getAllSessionsQueryParamsSchema
>;
export type GetAllSessionsResponseBody = z.infer<
    typeof getAllSessionsResponseSchema
>;

export type GetAllSessionsSuccessPayload = GetAllSessionsResponseBody;
