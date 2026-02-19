import { z } from 'zod';

export const siteSchema = z.object({
    siteId: z.number(),
    programId: z.number(),
    district: z.string().optional(),
    subCounty: z.string().optional(),
    parish: z.string().optional(),
    villageName: z.string().optional(),
    houseNumber: z.string().optional(),
    healthCenter: z.string().optional(),
    locationTypeId: z.number().optional(),
    name: z.string().optional(),
    locationHierarchy: z.record(z.string(), z.string()),
    isActive: z.boolean(),
    hasData: z.boolean().optional(),
});

export type Site = z.infer<typeof siteSchema>;
