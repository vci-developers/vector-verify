import { z } from 'zod';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';

export const putSurveillanceFormRequestSchema = z.object({
    numPeopleSleptInHouse: z.number().optional(),
    wasIrsConducted: z.boolean().optional(),
    monthsSinceIrs: z.number().nullable().optional(),
    numLlinsAvailable: z.number().optional(),
    llinType: z.string().nullable().optional(),
    llinBrand: z.string().nullable().optional(),
    numPeopleSleptUnderLlin: z.number().nullable().optional(),
});

export const putSurveillanceFormResponseSchema = z.object({
    message: z.string(),
    surveillanceForm: surveillanceFormSchema,
});

export type PutSurveillanceFormRequestBody = z.infer<
    typeof putSurveillanceFormRequestSchema
>;
export type PutSurveillanceFormResponseBody = z.infer<
    typeof putSurveillanceFormResponseSchema
>;
export type PutSurveillanceFormSuccessPayload = PutSurveillanceFormResponseBody;
