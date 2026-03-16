import { userProfileSchema } from '@/api/user/validation/user-profile-schema';
import { z } from 'zod';

export const signupRequestSchema = z.object({
    email: z.email(),
    password: z.string().min(1).max(128),
});

export const signupResponseSchema = z.object({
    message: z.string(),
    user: userProfileSchema,
    tokens: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
    }),
});

export type SignupRequestBody = z.infer<typeof signupRequestSchema>;
export type SignupResponseBody = z.infer<typeof signupResponseSchema>;

export type SignupSuccessPayload = Pick<SignupResponseBody, 'message' | 'user'>;
