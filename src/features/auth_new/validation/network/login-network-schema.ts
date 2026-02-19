import { userProfileSchema } from '@/api/user/validation/user-profile-schema';
import { z } from 'zod';

export const loginRequestSchema = z.object({
    email: z.email(),
    password: z.string().min(1).max(128),
});

export const loginResponseSchema = z.object({
    message: z.string(),
    user: userProfileSchema,
    tokens: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
    }),
});

export type LoginNetworkRequestBody = z.infer<typeof loginRequestSchema>;
export type LoginNetworkResponseBody = z.infer<typeof loginResponseSchema>;

export type LoginNetworkSuccessPayload = Pick<
    LoginNetworkResponseBody,
    'message' | 'user'
>;
