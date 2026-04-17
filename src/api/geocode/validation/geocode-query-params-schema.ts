import { z } from 'zod';

export const geocodeQueryParamsSchema = z.object({
    village: z.string().optional(),
    parish: z.string().optional(),
    subCounty: z.string().optional(),
    district: z.string().optional(),
    query: z.string().optional(),
});

export type GeocodeQueryParams = z.infer<typeof geocodeQueryParamsSchema>;
