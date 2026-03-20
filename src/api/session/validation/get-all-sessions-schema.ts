import { z } from 'zod';
import {
    sessionSchema,
    sessionStateSchema,
    sessionTypeSchema,
} from '@/api/session/validation/session-schema';

export const getAllSessionsQueryParamsSchema = z.object({
    district: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    state: sessionStateSchema.optional(),
    type: sessionTypeSchema.optional(),
});

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
