import { z } from 'zod';

export const llinTypeSchema = z.enum([
    'Pyrethroid Only',
    'Pyrethroid + PBO',
    'Pyrethroid + Chlorfenapyr',
    'Pyrethroid + Pyriproxyfen',
    'Other',
]);

export const LLIN_BRAND_OPTIONS = [
    { label: 'OLYSET Net', type: 'Pyrethroid Only' },
    { label: 'Interceptor', type: 'Pyrethroid Only' },
    { label: 'Royal Sentry', type: 'Pyrethroid Only' },
    { label: 'Royal Sentry 2.0', type: 'Pyrethroid Only' },
    { label: 'PermaNet 2.0', type: 'Pyrethroid Only' },
    { label: 'Duranet LLIN', type: 'Pyrethroid Only' },
    { label: 'MiraNet', type: 'Pyrethroid Only' },
    { label: 'MAGNet', type: 'Pyrethroid Only' },
    { label: 'Yahe LN', type: 'Pyrethroid Only' },
    { label: 'SafeNet', type: 'Pyrethroid Only' },
    { label: 'Yorkool LN', type: 'Pyrethroid Only' },
    { label: 'Panda Net 2.0', type: 'Pyrethroid Only' },
    { label: 'Tsara Soft', type: 'Pyrethroid Only' },
    { label: 'OLYSET Plus', type: 'Pyrethroid + PBO' },
    { label: 'PermaNet 3.0', type: 'Pyrethroid + PBO' },
    { label: 'VEERALIN', type: 'Pyrethroid + PBO' },
    { label: 'Tsara Boost', type: 'Pyrethroid + PBO' },
    { label: 'Tsara Plus', type: 'Pyrethroid + PBO' },
    { label: 'Interceptor G2', type: 'Pyrethroid + Chlorfenapyr' },
    { label: 'Royal Guard', type: 'Pyrethroid + Pyriproxyfen' },
    { label: 'Other', type: null },
] as const satisfies readonly {
    label: string;
    type: z.infer<typeof llinTypeSchema> | null;
}[];

export const llinBrandSchema = z.enum(
    LLIN_BRAND_OPTIONS.map(brand => brand.label),
);

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
