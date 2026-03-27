import { z } from 'zod';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';

export const getAllSurveillanceFormsQueryParamsSchema = z.object({
    sessionIds: z.array(z.number()),
});

export const getAllSurveillanceFormsResponseSchema = z.object({
    message: z.string(),
    surveillanceForms: z.array(surveillanceFormSchema),
});

export type GetAllSurveillanceFormsQueryParams = z.infer<
    typeof getAllSurveillanceFormsQueryParamsSchema
>;
export type GetAllSurveillanceFormsResponseBody = z.infer<
    typeof getAllSurveillanceFormsResponseSchema
>;

export type GetAllSurveillanceFormsSuccessPayload =
    GetAllSurveillanceFormsResponseBody;
