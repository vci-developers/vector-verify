import { z } from 'zod';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';

export const getSurveillanceFormBySessionIdResponseSchema =
    surveillanceFormSchema;

export type GetSurveillanceFormBySessionIdResponseBody = z.infer<
    typeof getSurveillanceFormBySessionIdResponseSchema
>;

export type GetSurveillanceFormBySessionIdSuccessPayload =
    GetSurveillanceFormBySessionIdResponseBody;
