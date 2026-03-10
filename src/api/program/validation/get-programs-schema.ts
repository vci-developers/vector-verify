import { z } from 'zod';
import { programSchema } from '@/api/program/validation/program-schema';

export const getProgramsResponseSchema = z.object({
    programs: z.array(programSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export type GetProgramsResponseBody = z.infer<typeof getProgramsResponseSchema>;
