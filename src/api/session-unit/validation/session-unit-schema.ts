import { z } from 'zod';

export const sessionUnitSchema = z.object({
    id: z.number(),
    frontendId: z.string().nullable(),
    sessionId: z.number(),
    unitOrder: z.number(),
    createdAt: z.number().nullable(),
    updatedAt: z.number().nullable(),
});

export type SessionUnit = z.infer<typeof sessionUnitSchema>;
