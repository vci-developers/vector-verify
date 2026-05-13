import { z } from 'zod';

export const programSchema = z.object({
    programId: z.number(),
    name: z.string(),
    country: z.string(),
});

export type Program = z.infer<typeof programSchema>;
