import { z } from 'zod';
import { reviewLogSchema } from '@/api/review-log/validation/review-log-schema';

export const specimenIdEditLogSchema = reviewLogSchema.extend({
    action: z.literal('update_specimen_thumbnail_prediction'),
    changes: z.object({
        specimenId: z.object({
            before: z.string(),
            after: z.string(),
        }),
    }),
});
