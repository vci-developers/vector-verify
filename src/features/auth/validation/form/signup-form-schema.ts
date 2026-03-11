import { z } from 'zod';

export const signupFormSchema = z
    .object({
        email: z.email('Enter a valid email'),
        name: z
            .string()
            .min(1, 'Name is required')
            .max(128, 'Name is too long'),
        programId: z.string().min(1, 'Program is required'),
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
