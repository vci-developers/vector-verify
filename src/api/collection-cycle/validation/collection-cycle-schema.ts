import { z } from 'zod';
import { collectionScheduleSchema } from '@/api/collection-schedule/validation/collection-schedule-schema';

export const collectionCycleSchema = z.object({
    id: z.number(),
    programId: z.number(),
    collectionScheduleId: z.number(),
    cycleNumber: z.number(),
    startDate: z.number(),
    endDate: z.number(),
    timezone: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
    collectionSchedule: collectionScheduleSchema.optional(),
});

export type CollectionCycle = z.infer<typeof collectionCycleSchema>;
