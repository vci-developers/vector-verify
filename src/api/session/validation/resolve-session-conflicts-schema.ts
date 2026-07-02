import { z } from 'zod';
import { sessionSchema } from '@/api/session/validation/session-schema';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';
import { formAnswerSchema } from '@/api/form-answer/validation/form-answer-schema';

export const resolveSessionConflictsRequestSchema = z.object({
    sessionIds: z.array(z.number()).optional(),
    sessionUnitIds: z.array(z.number()).optional(),
    resolvedData: sessionSchema.partial().optional(),
    resolvedSurveillanceForm: surveillanceFormSchema.partial().optional(),
    resolvedFormAnswers: z.array(formAnswerSchema.partial()).optional(),
});

export const resolveSessionConflictsResponseSchema = z.object({
    message: z.string(),
    resolutionId: z.number(),
    updatedSessionCount: z.number(),
});

export type ResolveSessionConflictsRequestBody = z.infer<
    typeof resolveSessionConflictsRequestSchema
>;
export type ResolveSessionConflictsResponseBody = z.infer<
    typeof resolveSessionConflictsResponseSchema
>;
export type ResolveSessionConflictsSuccessPayload =
    ResolveSessionConflictsResponseBody;
