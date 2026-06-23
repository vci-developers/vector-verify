import { z } from 'zod';

export const verifyEmailRequestSchema = z.object({
    token: z.string(),
});

export const verifyEmailResponseSchema = z.object({
    message: z.string(),
    user: z.object({
        id: z.number(),
        email: z.email(),
        emailVerified: z.boolean(),
    }),
});

export type VerifyEmailRequestBody = z.infer<typeof verifyEmailRequestSchema>;
export type VerifyEmailResponseBody = z.infer<typeof verifyEmailResponseSchema>;
export type VerifyEmailSuccessPayload = VerifyEmailResponseBody;
