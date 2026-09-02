import { z } from 'zod';
import { userSummarySchema } from '@/api/user/validation/user-summary-schema';

export const getAllUsersResponseSchema = z.object({
    message: z.string(),
    users: z.array(userSummarySchema),
});

export type GetAllUsersResponseBody = z.infer<typeof getAllUsersResponseSchema>;

export type GetAllUsersSuccessPayload = GetAllUsersResponseBody;
