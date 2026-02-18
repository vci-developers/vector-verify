import { z } from 'zod';

export const loginFormSchema = z.object({
    email: z.email('Enter a valid email'),
    password: z
        .string()
        .min(1, 'Password is required')
        .max(128, 'Password is too long'),
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;
