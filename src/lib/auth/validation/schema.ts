import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});
export type LoginFormData = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});
export type SignupFormData = z.infer<typeof SignupSchema>;
