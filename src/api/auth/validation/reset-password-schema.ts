import { z } from 'zod';

export const resetPasswordRequestSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(1).max(128),
});

export const resetPasswordResponseSchema = z.object({
    message: z.string(),
});

export type ResetPasswordRequestBody = z.infer<
    typeof resetPasswordRequestSchema
>;
export type ResetPasswordResponseBody = z.infer<
    typeof resetPasswordResponseSchema
>;

export type ResetPasswordSuccessPayload = ResetPasswordResponseBody;
