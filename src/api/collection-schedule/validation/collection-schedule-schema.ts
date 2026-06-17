import { z } from 'zod';

export const collectionScheduleSchema = z.object({
    id: z.number(),
    programId: z.number(),
    cadenceType: z.enum(['RECURRING', 'MANUAL']),
    intervalUnit: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']).nullable(),
    intervalCount: z.number().nullable(),
    effectiveStartDate: z.number(),
    effectiveEndDate: z.number().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export type CollectionSchedule = z.infer<typeof collectionScheduleSchema>;
