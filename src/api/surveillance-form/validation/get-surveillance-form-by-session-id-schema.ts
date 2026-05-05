import { z } from 'zod';
import {
    surveillanceFormSchema,
    type SurveillanceForm,
} from '@/api/surveillance-form/validation/surveillance-form-schema';
import type { FormAnswers } from '@/api/surveillance-form/validation/form-answers-schema';

export const getSurveillanceFormBySessionIdResponseSchema =
    surveillanceFormSchema;

export type GetSurveillanceFormBySessionIdResponseBody = z.infer<
    typeof getSurveillanceFormBySessionIdResponseSchema
>;

export type SurveillanceFormData =
    | ({ kind: 'answers' } & FormAnswers)
    | ({ kind: 'legacy' } & SurveillanceForm);

export type GetSurveillanceFormBySessionIdSuccessPayload = SurveillanceFormData;
