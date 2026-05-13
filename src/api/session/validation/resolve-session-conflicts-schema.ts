import { z } from 'zod';
import { sessionSchema } from '@/api/session/validation/session-schema';
import { surveillanceFormSchema } from '@/api/surveillance-form/validation/surveillance-form-schema';

export const resolveSessionConflictsRequestSchema = z.object({
    sessionIds: z.array(z.number()),
    resolvedData: sessionSchema.partial(),
    resolvedSurveillanceForm: surveillanceFormSchema.partial(),
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
