import { z } from 'zod';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';

export const getSurveillanceFormBySessionIdSchema = surveillanceFormSchema;

export type GetSurveillanceFormBySessionIdResponseBody = z.infer<
    typeof getSurveillanceFormBySessionIdSchema
>;

export type GetSurveillanceFormBySessionIdSuccessPayload =
    GetSurveillanceFormBySessionIdResponseBody;
