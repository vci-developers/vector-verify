import { z } from 'zod';

export const signupFormSchema = z
    .object({
        email: z.email('Enter a valid email'),
        password: z
            .string()
            .min(1, 'Password is required')
            .max(128, 'Password is too long'),
        confirmPassword: z.string().min(1, 'Confirm Password is required'),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords must match',
        path: ['confirmPassword'],
    });

export type SignupFormInput = z.infer<typeof signupFormSchema>;
