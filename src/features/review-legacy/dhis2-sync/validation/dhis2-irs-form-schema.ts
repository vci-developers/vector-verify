import { siteIrsDataSchema } from '@/api/dhis2/validation/post-dhis2-sync-task-schema';
import { z } from 'zod';

const siteIrsFormEntrySchema = siteIrsDataSchema
    .refine(
        entry => !entry.wasIrsSprayed || Boolean(entry.insecticideSprayed),
        {
            path: ['insecticideSprayed'],
            message: 'Select the insecticide used.',
        },
    )
    .refine(entry => !entry.wasIrsSprayed || Boolean(entry.dateLastSprayed), {
        path: ['dateLastSprayed'],
        message: 'Enter the date last sprayed.',
    });

export const dhis2IrsFormSchema = z.object({
    sitesIrsData: z.array(siteIrsFormEntrySchema),
});

export type Dhis2IrsFormInput = z.infer<typeof dhis2IrsFormSchema>;
