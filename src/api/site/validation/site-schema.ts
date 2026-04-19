import { z } from 'zod';

export const siteSchema = z.object({
    siteId: z.number(),
    programId: z.number(),
    district: z.string().nullable().optional(),
    subCounty: z.string().nullable().optional(),
    parish: z.string().nullable().optional(),
    villageName: z.string().nullable().optional(),
    houseNumber: z.string().nullable().optional(),
    healthCenter: z.string().nullable().optional(),
    locationTypeId: z.number().nullable().optional(),
    name: z.string().nullable().optional(),
    parentId: z.number().nullable().optional(),
    locationHierarchy: z.record(z.string(), z.string()),
    isActive: z.boolean(),
    hasData: z.boolean().optional(),
});

export type Site = z.infer<typeof siteSchema>;
