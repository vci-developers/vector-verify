import { z } from 'zod';

export const deviceSchema = z.object({
    deviceId: z.number(),
    model: z.string(),
    programId: z.number(),
    registeredAt: z.number(),
    submittedAt: z.number(),
});

export type Device = z.infer<typeof deviceSchema>;
