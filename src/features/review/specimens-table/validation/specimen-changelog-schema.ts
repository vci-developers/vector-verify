import { z } from 'zod';

const predictionChangeSchema = z.object({
    field: z.enum(['species', 'sex', 'abdomenStatus']),
    previousValue: z.string().nullable(),
    value: z.string().nullable(),
});

const predictionEditSchema = z.object({
    id: z.number(),
    reviewerName: z.string().nullable(),
    createdAt: z.number(),
    imageNumber: z.number().int().positive().nullable(),
    imageId: z.number().optional(),
    changes: z.array(predictionChangeSchema),
});

export const specimenChangelogSchema = z.object({
    specimenId: z.string(),
    sessionId: z.number(),
    siteId: z.number(),
    timezone: z.string(),
    edits: z.array(predictionEditSchema),
});

export type SpecimenChangelog = z.infer<typeof specimenChangelogSchema>;
