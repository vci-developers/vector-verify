import { z } from 'zod';
import { userProfileSchema } from './user-profile-schema';

export const getUserProfileResponseSchema = z.object({
    message: z.string(),
    user: userProfileSchema,
});

export type GetUserProfileResponseBody = z.infer<
    typeof getUserProfileResponseSchema
>;

export type GetUserProfileSuccessPayload = GetUserProfileResponseBody;
