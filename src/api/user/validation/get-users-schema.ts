import { z } from 'zod';
import { userSummarySchema } from '@/api/user/validation/user-summary-schema';

export const getUsersQueryParamsSchema = z.object({
    programId: z.coerce.number(),
});

export const getUsersResponseSchema = z.object({
    message: z.string(),
    users: z.array(userSummarySchema),
});

export type GetUsersQueryParams = z.infer<typeof getUsersQueryParamsSchema>;
export type GetUsersResponseBody = z.infer<typeof getUsersResponseSchema>;

export type GetUsersSuccessPayload = GetUsersResponseBody;
