import { z } from 'zod';

export const resetPasswordRequestSchema = z.object({
    email: z.email(),
    password: z.string().min(1).max(128),
});

export const resetPasswordResponseSchema = z.object({
    message: z.string(),
    // Need to decide what else to add after backend is set up
});

export type ResetPasswordRequestBody = z.infer<
    typeof resetPasswordRequestSchema
>;
export type ResetPasswordResponseBody = z.infer<
    typeof resetPasswordResponseSchema
>;

// TODO: create the success payload if necessary
