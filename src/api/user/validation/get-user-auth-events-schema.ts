import { z } from 'zod';
import { authEventSchema } from '@/api/user/validation/auth-event-schema';

export const getUserAuthEventsQueryParamsSchema = z.object({
    userId: z.coerce.number().optional(),
    eventType: z
        .enum(['login', 'logout', 'signup', 'token_refresh'])
        .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.coerce.number().min(1).max(500).optional(),
    offset: z.coerce.number().min(0).optional(),
});

export const getUserAuthEventsResponseSchema = z.object({
    message: z.string(),
    events: z.array(authEventSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export type GetUserAuthEventsQueryParams = z.infer<
    typeof getUserAuthEventsQueryParamsSchema
>;
export type GetUserAuthEventsResponseBody = z.infer<
    typeof getUserAuthEventsResponseSchema
>;

export type GetUserAuthEventsSuccessPayload = GetUserAuthEventsResponseBody;
