import { z } from 'zod';
import { userSummarySchema } from '@/api/user/validation/user-summary-schema';

export const getUsersResponseSchema = z.object({
    message: z.string(),
    users: z.array(userSummarySchema),
});

export type GetUsersResponseBody = z.infer<typeof getUsersResponseSchema>;

export type GetUsersSuccessPayload = GetUsersResponseBody;
