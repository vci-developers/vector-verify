import { z } from 'zod';

export const formAnswerSchema = z.object({
    id: z.number(),
    frontendId: z.string().nullable(),
    questionId: z.number(),
    parentId: z.number().nullable(),
    prerequisite: z.unknown(),
    label: z.string().nullable(),
    type: z.string().nullable(),
    required: z.boolean().nullable(),
    options: z.array(z.unknown()).nullable(),
    value: z.unknown(),
    dataType: z.string(),
    answerScope: z.enum(['SESSION', 'SESSION_UNIT']).nullable(),
    sessionUnitId: z.number().nullable(),
    sessionUnit: z
        .object({
            id: z.number(),
            frontendId: z.string(),
            sessionId: z.number(),
            unitOrder: z.number(),
            createdAt: z.number(),
            updatedAt: z.number(),
        })
        .nullable(),
    isUnitIdentityComponent: z.boolean().nullable(),
    submittedAt: z.number().nullable(),
    createdAt: z.number().nullable(),
    updatedAt: z.number().nullable(),
});

export type FormAnswer = z.infer<typeof formAnswerSchema>;
