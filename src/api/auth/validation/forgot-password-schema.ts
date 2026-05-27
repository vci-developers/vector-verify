import { z } from 'zod';

export const forgotPasswordRequestSchema = z.object({
    email: z.email(),
});

export const forgotPasswordResponseSchema = z.object({
    message: z.string(),
    // Need to decide what else to add after backend is set up
});

export type ForgotPasswordRequestBody = z.infer<
    typeof forgotPasswordRequestSchema
>;
export type ForgotPasswordResponseBody = z.infer<
    typeof forgotPasswordResponseSchema
>;

// TODO: create the success payload if necessary
