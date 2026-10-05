import { z } from 'zod';

export const postResetPasswordRequestSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8).max(128),
});

export const postResetPasswordResponseSchema = z.object({
    message: z.string(),
});

export type PostResetPasswordRequestBody = z.infer<
    typeof postResetPasswordRequestSchema
>;
export type PostResetPasswordResponseBody = z.infer<
    typeof postResetPasswordResponseSchema
>;

export type PostResetPasswordSuccessPayload = PostResetPasswordResponseBody;
