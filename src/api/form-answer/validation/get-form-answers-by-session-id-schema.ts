import { z } from 'zod';
import { formAnswerSchema } from './form-answer-schema';

export const getFormAnswersBySessionIdQueryParamsSchema = z.object({
    version: z.string().optional(),
});

export const getFormAnswersBySessionIdResponseSchema = z.object({
    formId: z.number(),
    formName: z.string(),
    formVersion: z.string(),
    programId: z.number(),
    sessionId: z.number(),
    answers: z.array(formAnswerSchema),
});

export type GetFormAnswersBySessionIdQueryParams = z.infer<
    typeof getFormAnswersBySessionIdQueryParamsSchema
>;
export type GetFormAnswersBySessionIdResponseBody = z.infer<
    typeof getFormAnswersBySessionIdResponseSchema
>;

export type GetFormAnswersBySessionIdSuccessPayload =
    GetFormAnswersBySessionIdResponseBody;
