import { z } from 'zod';
import { userProfileSchema } from './user-profile-schema';

export const getUserProfileSchema = z.object({
    message: z.string(),
    user: userProfileSchema,
});

export type GetUserProfileResponseBody = z.infer<typeof getUserProfileSchema>;

export type GetUserProfileSuccessPayload = GetUserProfileResponseBody;
