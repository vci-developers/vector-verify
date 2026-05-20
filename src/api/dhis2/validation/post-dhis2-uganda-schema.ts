import { z } from 'zod';

export const siteIrsDataSchema = z.object({
    siteId: z.number(),
    wasIrsSprayed: z.boolean(),
    insecticideSprayed: z.string().optional(),
    dateLastSprayed: z.string().optional(),
});

export const postDhis2UgandaExportBodySchema = z.object({
    irsData: z.array(siteIrsDataSchema),
});

export type SiteIrsData = z.infer<typeof siteIrsDataSchema>;
export type PostDhis2UgandaExportBody = z.infer<
    typeof postDhis2UgandaExportBodySchema
>;
