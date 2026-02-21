import { deviceSchema } from '@/api/device/validation/device-schema';
import { siteSchema } from '@/api/site/validation/site-schema';
import { z } from 'zod';

export const sessionSchema = z.object({
    sessionId: z.number(),
    frontendId: z.string(),
    collectorTitle: z.string(),
    collectorName: z.string(),
    collectorLastTrainedOn: z.number().nullable(),
    collectionDate: z.number(),
    collectionMethod: z.string(),
    specimenCondition: z.string(),
    createdAt: z.number(),
    completedAt: z.number().nullable(),
    submittedAt: z.number(),
    notes: z.string(),
    siteId: z.number(),
    deviceId: z.number(),
    hardwareId: z.string().nullable(),
    type: z.enum(['SURVEILLANCE', 'DATA_COLLECTION']),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    site: siteSchema.optional(),
    device: deviceSchema.optional(),
});

export type Session = z.infer<typeof sessionSchema>;
