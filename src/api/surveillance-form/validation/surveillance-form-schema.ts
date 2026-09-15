import { z } from 'zod';

export const llinTypeSchema = z.enum([
    'Pyrethroid-only',
    'Pyrethroid + PBO',
    'Pyrethroid + chlorfenapyr',
    'Pyrethroid + pyriproxyfen',
    'Other',
]);

export const llinBrandSchema = z.enum([
    'OLYSET Net',
    'OLYSET PLUS',
    'Interceptor',
    'Interceptor G2',
    'Royal Sentry',
    'Royal Sentry 2.0',
    'Royal Guard',
    'PermaNet 2.0',
    'PermaNet 3.0',
    'Duranet LLIN',
    'MiraNet',
    'MAGNet',
    'VEERALIN',
    'Yahe LN',
    'SafeNet',
    'Yorkool LN',
    'Panda Net 2.0',
    'Tsara Boost',
    'Tsara Soft',
    'Tsara Plus',
    'Other',
]);

export const surveillanceFormSchema = z.object({
    formId: z.number(),
    sessionId: z.number(),
    submittedAt: z.number(),
    numPeopleSleptInHouse: z.number().nullable(),
    wasIrsConducted: z.boolean().nullable(),
    monthsSinceIrs: z.number().nullable(),
    numLlinsAvailable: z.number().nullable(),
    llinType: z.string().nullable(),
    llinBrand: z.string().nullable(),
    numPeopleSleptUnderLlin: z.number().nullable(),
});

export type SurveillanceForm = z.infer<typeof surveillanceFormSchema>;
export type LlinType = z.infer<typeof llinTypeSchema>;
export type LlinBrand = z.infer<typeof llinBrandSchema>;
