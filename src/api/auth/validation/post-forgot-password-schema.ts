import { z } from 'zod';

export const postForgotPasswordRequestSchema = z.object({
    email: z.email(),
});

export const postForgotPasswordResponseSchema = z.object({
    message: z.string(),
});

export type PostForgotPasswordRequestBody = z.infer<
    typeof postForgotPasswordRequestSchema
>;
export type PostForgotPasswordResponseBody = z.infer<
    typeof postForgotPasswordResponseSchema
>;

export type PostForgotPasswordSuccessPayload = PostForgotPasswordResponseBody;
