import { z } from 'zod';

export const postVerifyEmailRequestSchema = z.object({
    token: z.string(),
});

export const postVerifyEmailResponseSchema = z.object({
    message: z.string(),
    user: z.object({
        id: z.number(),
        email: z.email(),
        emailVerified: z.boolean(),
    }),
});

export type PostVerifyEmailRequestBody = z.infer<
    typeof postVerifyEmailRequestSchema
>;
export type PostVerifyEmailResponseBody = z.infer<
    typeof postVerifyEmailResponseSchema
>;
export type PostVerifyEmailSuccessPayload = PostVerifyEmailResponseBody;
