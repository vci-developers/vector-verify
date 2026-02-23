import { z } from 'zod';

export const surveillanceFormSchema = z.object({
    formId: z.number(),
    sessionId: z.number(),
    submittedAt: z.number(),
    numPeopleSleptInHouse: z.number(),
    wasIrsConducted: z.boolean(),
    monthsSinceIrs: z.number().nullable(),
    numLlinsAvailable: z.number(),
    llinType: z.string().nullable(),
    llinBrand: z.string().nullable(),
    numPeopleSleptUnderLlin: z.number().nullable(),
});

export type SurveillanceForm = z.infer<typeof surveillanceFormSchema>;
