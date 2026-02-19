import { z } from 'zod';

export const locationTypeSchema = z.object({
    id: z.number(),
    programId: z.number(),
    name: z.string(),
});

export type LocationType = z.infer<typeof locationTypeSchema>;
