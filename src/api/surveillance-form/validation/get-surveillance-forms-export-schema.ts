import { z } from 'zod';

export const getSurveillanceFormsExportQueryParamsSchema = z.object({
    programId: z.coerce.number(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    programCountry: z.string().optional(),
    siteId: z.coerce.number().optional(),
    district: z.string().optional(),
});

export type GetSurveillanceFormsExportQueryParams = z.infer<
    typeof getSurveillanceFormsExportQueryParamsSchema
>;
