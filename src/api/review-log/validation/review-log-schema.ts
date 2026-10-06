import { z } from 'zod';

export const reviewLogActionSchema = z.enum([
    'resolve_session_conflicts',
    'resolve_session_unit_conflicts',
    'update_session_household_info',
    'update_specimen_image_prediction',
]);

export const reviewLogSchema = z.object({
    id: z.number(),
    siteId: z.number(),
    year: z.number(),
    month: z.number(),
    action: reviewLogActionSchema,
    userId: z.number().nullable(),
    performedBy: z
        .object({
            userId: z.number(),
            name: z.string().nullable(),
        })
        .nullable(),
    collectionCycleId: z.number().nullable(),
    hasChanges: z.boolean(),
    changes: z.record(z.string(), z.unknown()).nullable(),
    fields: z.record(z.string(), z.unknown()).nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export type ReviewLogAction = z.infer<typeof reviewLogActionSchema>;
export type ReviewLog = z.infer<typeof reviewLogSchema>;
