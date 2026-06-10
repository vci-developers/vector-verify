import { z } from 'zod';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';

export const resolvedFormAnswerSchema = z.object({
    questionId: z.number(),
    value: z.unknown(),
    dataType: z.string().optional(),
});

export const resolvedSessionDataSchema = z.object({
    collectorName: z.string().optional(),
    collectorTitle: z.string().optional(),
    collectionMethod: z.string().optional(),
});

export const resolveSessionConflictsRequestSchema = z.union([
    z
        .object({
            sessionIds: z.array(z.number()).min(2),
            resolvedData: resolvedSessionDataSchema.optional(),
            resolvedSurveillanceForm: surveillanceFormSchema
                .partial()
                .optional(),
            resolvedFormAnswers: z
                .array(resolvedFormAnswerSchema)
                .nullable()
                .optional(),
        })
        .strict(),
    z
        .object({
            sessionUnitIds: z.array(z.number()).min(2),
            resolvedFormAnswers: z
                .array(resolvedFormAnswerSchema)
                .nullable()
                .optional(),
        })
        .strict(),
]);

export const resolveSessionConflictsResponseSchema = z.object({
    message: z.string(),
    resolutionId: z.number(),
    updatedSessionCount: z.number(),
    updatedSessionUnitCount: z.number(),
});

export type ResolvedFormAnswer = z.infer<typeof resolvedFormAnswerSchema>;
export type ResolvedSessionData = z.infer<typeof resolvedSessionDataSchema>;
export type ResolveSessionConflictsRequestBody = z.infer<
    typeof resolveSessionConflictsRequestSchema
>;
export type ResolveSessionConflictsResponseBody = z.infer<
    typeof resolveSessionConflictsResponseSchema
>;
export type ResolveSessionConflictsSuccessPayload =
    ResolveSessionConflictsResponseBody;
