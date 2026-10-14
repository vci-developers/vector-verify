import { z } from 'zod';

export const forgotPasswordFormSchema = z.object({
    email: z.email('Enter a valid email'),
});

export type ForgotPasswordFormInput = z.infer<typeof forgotPasswordFormSchema>;
