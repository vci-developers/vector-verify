import { z } from 'zod';

export const activeMetricSnapshotSchema = z.object({
    id: z.number(),
    snapshotDate: z.string(),
    programId: z.number().nullable(),
    a1Count: z.number(),
    a7Count: z.number(),
    a30Count: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type ActiveMetricSnapshot = z.infer<typeof activeMetricSnapshotSchema>;
