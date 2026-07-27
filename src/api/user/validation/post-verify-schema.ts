import { z } from 'zod';

export const postVerifyRequestSchema = z.object({
    token: z.string(),
});

export const postVerifyResponseSchema = z.object({
    message: z.string(),
    user: z.object({
        id: z.number(),
        email: z.email(),
        emailVerified: z.boolean(),
    }),
});

export type PostVerifyRequestBody = z.infer<typeof postVerifyRequestSchema>;
export type PostVerifyResponseBody = z.infer<typeof postVerifyResponseSchema>;
export type PostVerifySuccessPayload = PostVerifyResponseBody;
