import { z } from 'zod';
import { programSchema } from '@/api/program/validation/program-schema';

export const getProgramsResponseSchema = z.object({
    programs: z.array(programSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
});

export const getProgramsQueryParamsSchema = z.object({
    programId: z.coerce.number().optional(),
    name: z.string().optional(),
    country: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    offset: z.coerce.number().min(0).optional(),
});

export type GetProgramsResponseBody = z.infer<typeof getProgramsResponseSchema>;
