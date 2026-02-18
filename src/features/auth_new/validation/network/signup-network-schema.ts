import { z } from 'zod';

export const signupRequestSchema = z.object({
    email: z.email(),
    password: z.string().min(1).max(128),
});

export const signupResponseSchema = z.object({
    message: z.string(),
    user: z.object({
        id: z.number(),
        email: z.email(),
        privilege: z.number(),
        isActive: z.boolean(),
    }),
    tokens: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
    }),
});

export type SignupNetworkRequestBody = z.infer<typeof signupRequestSchema>;
export type SignupNetworkResponseBody = z.infer<typeof signupResponseSchema>;

export type SignupNetworkSuccessPayload = Pick<
    SignupNetworkResponseBody,
    'message' | 'user'
>;
