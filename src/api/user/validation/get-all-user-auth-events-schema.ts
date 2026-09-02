import { z } from 'zod';
import { authEventSchema } from '@/api/user/validation/auth-event-schema';

export const getAllUserAuthEventsQueryParamsSchema = z.object({
    eventType: z
        .enum(['login', 'logout', 'signup', 'token_refresh'])
        .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const getAllUserAuthEventsResponseSchema = z.object({
    message: z.string(),
    events: z.array(authEventSchema),
});

export type GetAllUserAuthEventsQueryParams = z.infer<
    typeof getAllUserAuthEventsQueryParamsSchema
>;
export type GetAllUserAuthEventsResponseBody = z.infer<
    typeof getAllUserAuthEventsResponseSchema
>;

export type GetAllUserAuthEventsSuccessPayload =
    GetAllUserAuthEventsResponseBody;
