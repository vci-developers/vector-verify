import { z } from 'zod';

export const userProfileSchema = z.object({
    id: z.number(),
    email: z.email(),
    privilege: z.number(),
    programId: z.number().nullable().optional(),
    isActive: z.boolean(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
