import { z } from 'zod';
import { sessionSchema } from '@/api/session/validation/session-schema';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';

export const resolvedFormAnswerSchema = z.object({
    questionId: z.number(),
    value: z.unknown(),
    dataType: z.string().optional(),
});

export const resolveSessionConflictsRequestSchema = z.object({
    sessionIds: z.array(z.number()),
    resolvedData: sessionSchema.partial(),
    resolvedSurveillanceForm: surveillanceFormSchema.partial(),
    resolvedFormAnswers: z.array(resolvedFormAnswerSchema).optional(),
});

export const resolveSessionConflictsResponseSchema = z.object({
    message: z.string(),
    resolutionId: z.number(),
    updatedSessionCount: z.number(),
    updatedSessionUnitCount: z.number(),
});

export type ResolvedFormAnswer = z.infer<typeof resolvedFormAnswerSchema>;
export type ResolveSessionConflictsRequestBody = z.infer<
    typeof resolveSessionConflictsRequestSchema
>;
export type ResolveSessionConflictsResponseBody = z.infer<
    typeof resolveSessionConflictsResponseSchema
>;
export type ResolveSessionConflictsSuccessPayload =
    ResolveSessionConflictsResponseBody;
