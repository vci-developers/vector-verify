import { z } from 'zod';
import { authEventSchema } from '@/api/user/validation/auth-event-schema';

export const dailyLoginCountSchema = z.object({
    date: z.string(),
    count: z.number(),
});

export const userLoginActivitySchema = z.object({
    userId: z.number(),
    email: z.email(),
    name: z.string().nullable(),
    totalLogins: z.number(),
    dailyLogins: z.array(dailyLoginCountSchema),
});

export const getUserAuthEventsQueryParamsSchema = z.object({
    eventType: z.literal('login'),
    startDate: z.string(),
    endDate: z.string(),
    programId: z.coerce.number(),
});

export const getUserAuthEventsResponseSchema = z.object({
    message: z.string(),
    events: z.array(authEventSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
    distinctUserCount: z.number(),
    users: z.array(userLoginActivitySchema),
});

export type DailyLoginCount = z.infer<typeof dailyLoginCountSchema>;
export type UserLoginActivity = z.infer<typeof userLoginActivitySchema>;
export type GetUserAuthEventsQueryParams = z.infer<
    typeof getUserAuthEventsQueryParamsSchema
>;
export type GetUserAuthEventsResponseBody = z.infer<
    typeof getUserAuthEventsResponseSchema
>;
export type GetUserAuthEventsSuccessPayload = GetUserAuthEventsResponseBody;
