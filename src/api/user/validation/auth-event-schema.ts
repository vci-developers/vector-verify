import { z } from 'zod';

export const authEventSchema = z.object({
    id: z.number(),
    userId: z.number(),
    eventType: z.enum(['login', 'logout', 'signup', 'token_refresh']),
    ipAddress: z.string().nullable(),
    userAgent: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type AuthEvent = z.infer<typeof authEventSchema>;
