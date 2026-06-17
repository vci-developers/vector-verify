import { z } from 'zod';

export const forgotPasswordRequestSchema = z.object({
    email: z.email(),
});

export const forgotPasswordResponseSchema = z.object({
    message: z.string(),
});

export type ForgotPasswordRequestBody = z.infer<
    typeof forgotPasswordRequestSchema
>;
export type ForgotPasswordResponseBody = z.infer<
    typeof forgotPasswordResponseSchema
>;

export type forgotPasswordSuccessPayload = ForgotPasswordResponseBody;
