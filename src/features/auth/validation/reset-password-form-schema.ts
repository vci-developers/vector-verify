import { z } from 'zod';

export const resetPasswordFormSchema = z
    .object({
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password is too long'),
        confirmPassword: z.string().min(1, 'Confirm Password is required'),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords must match',
        path: ['confirmPassword'],
    });

export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;
