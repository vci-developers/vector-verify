import { z } from 'zod';

export const userSummarySchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string().nullable(),
    privilege: z.number(),
    isDeveloper: z.boolean(),
    programId: z.number().nullable(),
    isActive: z.boolean(),
    emailVerified: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type UserSummary = z.infer<typeof userSummarySchema>;
