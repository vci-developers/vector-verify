import { z } from 'zod';

export const userProfileSchema = z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.email(),
    privilege: z.number(),
    programId: z.number().nullable().optional(),
    isActive: z.boolean(),
    isWhitelisted: z.boolean().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
