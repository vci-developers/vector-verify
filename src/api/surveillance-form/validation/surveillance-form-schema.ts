import { z } from 'zod';

export const llinTypeSchema = z.enum([
    'Pyrethroid-only',
    'Pyrethroid + PBO',
    'Pyrethroid + chlorfenapyr',
    'Pyrethroid + pyriproxyfen',
    'Other',
]);

export const LLIN_BRAND_OPTIONS = [
    { label: 'OLYSET Net', type: 'Pyrethroid-only' },
    { label: 'Interceptor', type: 'Pyrethroid-only' },
    { label: 'Royal Sentry', type: 'Pyrethroid-only' },
    { label: 'Royal Sentry 2.0', type: 'Pyrethroid-only' },
    { label: 'PermaNet 2.0', type: 'Pyrethroid-only' },
    { label: 'Duranet LLIN', type: 'Pyrethroid-only' },
    { label: 'MiraNet', type: 'Pyrethroid-only' },
    { label: 'MAGNet', type: 'Pyrethroid-only' },
    { label: 'Yahe LN', type: 'Pyrethroid-only' },
    { label: 'SafeNet', type: 'Pyrethroid-only' },
    { label: 'Yorkool LN', type: 'Pyrethroid-only' },
    { label: 'Panda Net 2.0', type: 'Pyrethroid-only' },
    { label: 'Tsara Soft', type: 'Pyrethroid-only' },
    { label: 'OLYSET PLUS', type: 'Pyrethroid + PBO' },
    { label: 'PermaNet 3.0', type: 'Pyrethroid + PBO' },
    { label: 'VEERALIN', type: 'Pyrethroid + PBO' },
    { label: 'Tsara Boost', type: 'Pyrethroid + PBO' },
    { label: 'Tsara Plus', type: 'Pyrethroid + PBO' },
    { label: 'Interceptor G2', type: 'Pyrethroid + chlorfenapyr' },
    { label: 'Royal Guard', type: 'Pyrethroid + pyriproxyfen' },
    { label: 'Other', type: null },
] as const satisfies readonly {
    label: string;
    type: z.infer<typeof llinTypeSchema> | null;
}[];

export const llinBrandSchema = z.enum(
    LLIN_BRAND_OPTIONS.map(brand => brand.label) as [string, ...string[]],
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
