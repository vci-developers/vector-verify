import { z } from 'zod';
import {
    sessionSchema,
    sessionStateSchema,
} from '@/api/session/validation/session-schema';

export const getAllSessionsQueryParamsSchema = z.object({
    district: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    state: sessionStateSchema.optional(),
    type: z.enum(['SURVEILLANCE', 'DATA_COLLECTION']).optional(),
});

export const getAllSessionsResponseSchema = z.object({
    sessions: z.array(sessionSchema),
    message: z.string(),
});

export type GetAllSessionsQueryParams = z.infer<
    typeof getAllSessionsQueryParamsSchema
>;
export type GetAllSessionsResponseBody = z.infer<
    typeof getAllSessionsResponseSchema
>;

export type GetAllSessionsSuccessPayload = GetAllSessionsResponseBody;
